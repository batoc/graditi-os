import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit,
  where,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Material, MaterialFormData, MovimientoMaterial } from '@/types/inventory';

const MATERIALS_COLLECTION = 'materiales';
const MOVEMENTS_COLLECTION = 'movimientos_materiales';

// ==================== MATERIALES CRUD ====================

export const addMaterial = async (data: MaterialFormData): Promise<string> => {
  try {
    const initialQty = Number(data.cantidadInicial || 0);

    // 1. Crear el documento del material
    const materialData: Omit<Material, 'id'> = {
      nombre: data.nombre,
      codigo: data.codigo,
      categoria: data.categoria,
      unidad: data.unidad,
      cantidadDisponible: initialQty, // Establecer stock inicial
      cantidadMinima: Number(data.cantidadMinima || 0),
      descripcion: data.descripcion || '',
      ubicacion: data.ubicacion || '',
      precioUnitario: data.precioUnitario ? Number(data.precioUnitario) : undefined,
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), materialData);

    // 2. Si hay stock inicial, crear un movimiento de entrada "Inicial"
    if (initialQty > 0) {
      await addMaterialMovement({
        materialId: docRef.id,
        materialNombre: data.nombre,
        tipo: 'entrada',
        cantidad: initialQty,
        observaciones: 'Inventario Inicial',
        fecha: Date.now(),
        usuarioId: 'admin' // In a real app grab from context
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding material:', error);
    throw error;
  }
};

export const getMaterials = async (): Promise<Material[]> => {
  try {
    const q = query(collection(db, MATERIALS_COLLECTION), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Material));
  } catch (error) {
    console.error('Error getting materials:', error);
    throw error;
  }
};

export const getMaterialById = async (id: string): Promise<Material | null> => {
  try {
    const docRef = doc(db, MATERIALS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Material;
    }
    return null;
  } catch (error) {
    console.error('Error getting material by id:', error);
    throw error;
  }
};

export const updateMaterial = async (id: string, data: Partial<MaterialFormData>): Promise<void> => {
    try {
        const updateData: Record<string, unknown> = {};
        if (data.nombre) updateData.nombre = data.nombre;
        if (data.categoria) updateData.categoria = data.categoria;
        if (data.unidad) updateData.unidad = data.unidad;
        if (data.cantidadMinima) updateData.cantidadMinima = Number(data.cantidadMinima);
        if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion;
        if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
        if (data.precioUnitario) updateData.precioUnitario = Number(data.precioUnitario);
        
        updateData.updatedAt = Date.now();
        
        const docRef = doc(db, MATERIALS_COLLECTION, id);
        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating material:', error);
        throw error;
    }
}

// ==================== MOVIMIENTOS E INVENTARIO ====================

/**
 * Registra un movimiento de material y actualiza el stock de manera transaccional via Firestore Transaction.
 * Esto asegura que si dos personas mueven el inventario al mismo tiempo, no se pierda información.
 */
export const registrarMovimientoMaterial = async (movimiento: MovimientoMaterial): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const materialRef = doc(db, MATERIALS_COLLECTION, movimiento.materialId);
      const materialDoc = await transaction.get(materialRef);

      if (!materialDoc.exists()) {
        throw new Error("Material no existe");
      }

      const currentStock = materialDoc.data().cantidadDisponible || 0;
      let newStock = currentStock;

      if (movimiento.tipo === 'entrada') {
        newStock += movimiento.cantidad;
      } else {
        if (currentStock < movimiento.cantidad) {
          throw new Error(`Stock insuficiente. Disponible: ${currentStock}, Solicitado: ${movimiento.cantidad}`);
        }
        newStock -= movimiento.cantidad;
      }

      // 1. Actualizar el stock del material
      transaction.update(materialRef, { 
        cantidadDisponible: newStock, 
        updatedAt: Date.now() 
      });

      // 2. Crear el registro del movimiento
      const movimientoRef = doc(collection(db, MOVEMENTS_COLLECTION));
      transaction.set(movimientoRef, {
        ...movimiento,
        fecha: Date.now()
      });
    });
  } catch (error) {
    console.error('Error registrando movimiento:', error);
    throw error;
  }
};

// Helper interno para crear movimiento sin transacción (usado solo en creación inicial donde no hay concurrencia esperada sobre ese ID nuevo)
const addMaterialMovement = async (movimiento: MovimientoMaterial) => {
    await addDoc(collection(db, MOVEMENTS_COLLECTION), movimiento);
}

export const getMaterialMovements = async (materialId: string): Promise<MovimientoMaterial[]> => {
    try {
        const q = query(
            collection(db, MOVEMENTS_COLLECTION), 
            where('materialId', '==', materialId),
            orderBy('fecha', 'desc'),
            limit(50)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as MovimientoMaterial));
    } catch(error) {
        console.error("Error getting movements:", error);
        return [];
    }
}
