import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Prestamo, PrestamoHerramienta } from '@/types/inventory';
import { updateToolStatus } from './tools';

const COLLECTION_NAME = 'prestamos';

// ==================== CREAR PRÉSTAMO (SALIDA) ====================

export const crearPrestamoSalida = async (
  colaboradorId: string,
  colaboradorNombre: string,
  obraId: string,
  obraNombre: string,
  herramientas: PrestamoHerramienta[],
  recibidoPor: string,
  observaciones?: string
): Promise<string> => {
  try {
    const batch = writeBatch(db);
    
    // Crear préstamo
    const prestamoRef = doc(collection(db, COLLECTION_NAME));
    batch.set(prestamoRef, {
      tipo: 'salida',
      colaboradorId,
      colaboradorNombre,
      obraId,
      obraNombre,
      herramientas: herramientas.map(h => ({
        ...h,
        devuelto: false
      })),
      estado: 'activo',
      fechaSalida: Date.now(),
      observaciones: observaciones || '',
      recibidoPor,
      createdAt: Date.now()
    });
    
    // Actualizar estado de herramientas a "en_uso"
    for (const herramienta of herramientas) {
      const toolRef = doc(db, 'herramientas', herramienta.toolId);
      batch.update(toolRef, { 
        estado: 'en_uso',
        updatedAt: Date.now()
      });
    }
    
    await batch.commit();
    return prestamoRef.id;
  } catch (error) {
    console.error('Error creating prestamo salida:', error);
    throw error;
  }
};

// ==================== DEVOLVER HERRAMIENTAS (ENTRADA) ====================

export const devolverHerramientas = async (
  prestamoId: string,
  herramientasDevueltas: {
    toolId: string;
    estadoDevolucion: 'bueno' | 'regular' | 'malo';
    observaciones?: string;
  }[],
  continuaEnObra: boolean,
  nuevaObraId?: string,
  nuevaObraNombre?: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const prestamoRef = doc(db, COLLECTION_NAME, prestamoId);
    const prestamoSnap = await getDoc(prestamoRef);
    
    if (!prestamoSnap.exists()) {
      throw new Error('Préstamo no encontrado');
    }
    
    const prestamo = prestamoSnap.data() as Prestamo;
    const herramientasActualizadas = prestamo.herramientas.map(h => {
      const devuelta = herramientasDevueltas.find(d => d.toolId === h.toolId);
      if (devuelta) {
        return {
          ...h,
          devuelto: true,
          fechaDevolucion: Date.now(),
          estadoDevolucion: devuelta.estadoDevolucion,
          observacionesDevolucion: devuelta.observaciones
        };
      }
      return h;
    });
    
    const todasDevueltas = herramientasActualizadas.every(h => h.devuelto);
    const algunasDevueltas = herramientasActualizadas.some(h => h.devuelto);
    
    // Actualizar préstamo
    batch.update(prestamoRef, {
      herramientas: herramientasActualizadas,
      estado: todasDevueltas ? 'devuelto' : (algunasDevueltas ? 'parcial' : 'activo'),
      fechaDevolucion: todasDevueltas ? Date.now() : null,
      updatedAt: Date.now()
    });
    
    // Si continúa en obra con herramientas no devueltas
    if (continuaEnObra && !todasDevueltas) {
      const herramientasNoDevueltas = herramientasActualizadas
        .filter(h => !h.devuelto)
        .map(h => ({
          toolId: h.toolId,
          toolCode: h.toolCode,
          toolNombre: h.toolNombre,
          devuelto: false
        }));
      
      // Crear nuevo préstamo
      const nuevoPrestamoRef = doc(collection(db, COLLECTION_NAME));
      batch.set(nuevoPrestamoRef, {
        tipo: 'salida',
        colaboradorId: prestamo.colaboradorId,
        colaboradorNombre: prestamo.colaboradorNombre,
        obraId: nuevaObraId || prestamo.obraId,
        obraNombre: nuevaObraNombre || prestamo.obraNombre,
        herramientas: herramientasNoDevueltas,
        estado: 'activo',
        fechaSalida: Date.now(),
        observaciones: `Continúa de préstamo anterior #${prestamoId}`,
        recibidoPor: prestamo.recibidoPor,
        createdAt: Date.now()
      });
    }
    
    // Actualizar estado de herramientas devueltas a "disponible"
    for (const devuelta of herramientasDevueltas) {
      const toolRef = doc(db, 'herramientas', devuelta.toolId);
      const nuevoEstado = devuelta.estadoDevolucion === 'malo' ? 'mantenimiento' : 'disponible';
      batch.update(toolRef, { 
        estado: nuevoEstado,
        updatedAt: Date.now()
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error devolviendo herramientas:', error);
    throw error;
  }
};

// ==================== CONSULTAS ====================

export const getPrestamos = async (): Promise<Prestamo[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('fechaSalida', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prestamo));
  } catch (error) {
    console.error('Error getting all prestamos:', error);
    // If orderBy fails due to index, fall back to client-side sorting
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const prestamos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Prestamo));
      return prestamos.sort((a, b) => b.fechaSalida - a.fechaSalida);
    } catch (fallbackError) {
      console.error('Error in fallback query:', fallbackError);
      return [];
    }
  }
};

export const getPrestamosActivos = async (): Promise<Prestamo[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('estado', '==', 'activo')
    );
    const querySnapshot = await getDocs(q);
    const prestamos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prestamo));
    
    // Ordenar en memoria por fecha de salida descendente
    return prestamos.sort((a, b) => b.fechaSalida - a.fechaSalida);
  } catch (error) {
    console.error('Error getting prestamos activos:', error);
    throw error;
  }
};

export const getPrestamosPorColaborador = async (colaboradorId: string): Promise<Prestamo[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('colaboradorId', '==', colaboradorId)
    );
    const querySnapshot = await getDocs(q);
    const prestamos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prestamo));
    
    // Ordenar en memoria
    return prestamos.sort((a, b) => b.fechaSalida - a.fechaSalida);
  } catch (error) {
    console.error('Error getting prestamos por colaborador:', error);
    throw error;
  }
};

export const getPrestamosPorObra = async (obraId: string): Promise<Prestamo[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('obraId', '==', obraId)
    );
    const querySnapshot = await getDocs(q);
    const prestamos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Prestamo));
    
    // Ordenar en memoria
    return prestamos.sort((a, b) => b.fechaSalida - a.fechaSalida);
  } catch (error) {
    console.error('Error getting prestamos por obra:', error);
    throw error;
  }
};

export const getHistorialHerramienta = async (toolId: string): Promise<Prestamo[]> => {
  try {
    const allPrestamos = await getDocs(collection(db, COLLECTION_NAME));
    const prestamosWithTool = allPrestamos.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Prestamo))
      .filter(prestamo => 
        prestamo.herramientas.some(h => h.toolId === toolId)
      )
      .sort((a, b) => b.fechaSalida - a.fechaSalida);
    
    return prestamosWithTool;
  } catch (error) {
    console.error('Error getting historial herramienta:', error);
    throw error;
  }
};

export const getPrestamoById = async (id: string): Promise<Prestamo | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Prestamo;
    }
    return null;
  } catch (error) {
    console.error('Error getting prestamo:', error);
    throw error;
  }
};
