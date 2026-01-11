import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tool, ToolFormData, Movement, ToolStatus, MaintenanceRecord } from '@/types/inventory';

const COLLECTION_NAME = 'herramientas';
const MOVEMENTS_COLLECTION = 'movimientos';
const MAINTENANCE_COLLECTION = 'mantenimientos';

export const addTool = async (data: ToolFormData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      nombre: data.nombre,
      codigo: data.codigo,
      categoria: data.categoria,
      estado: data.estado,
      ubicacion: data.ubicacion,
      descripcion: data.descripcion || '',
      nextMaintenanceDate: data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate).getTime() : null,
      imagenUrl: data.imagenUrl || '',
      createdAt: Date.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding tool:', error);
    throw error;
  }
};

export const getTools = async (): Promise<Tool[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Tool));
  } catch (error) {
    console.error('Error getting tools:', error);
    throw error;
  }
};

export const getToolById = async (id: string): Promise<Tool | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Tool;
    }
    return null;
  } catch (error) {
    console.error('Error getting tool:', error);
    throw error;
  }
};

export const getToolByCode = async (code: string): Promise<Tool | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('codigo', '==', code),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Tool;
    }
    return null;
  } catch (error) {
    console.error('Error finding tool by code:', error);
    throw error;
  }
};

export const updateToolStatus = async (id: string, status: ToolStatus) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { 
    estado: status,
    updatedAt: Date.now()
  });
};

export const deleteTool = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting tool:', error);
    throw error;
  }
};

export const addMovement = async (movement: Movement) => {
  try {
    // 1. Add movement record
    await addDoc(collection(db, MOVEMENTS_COLLECTION), {
      ...movement,
      timestamp: Date.now()
    });

    // 2. Update tool status and location
    const newStatus: ToolStatus = movement.type === 'salida' ? 'en_uso' : 'disponible';
    
    // If it's a 'salida', location becomes destination. If 'entrada', location becomes 'Bodega' (default)
    // Note: If entering from an Obra, user might want to set specific bodega location, defaulting to 'Bodega' for now.
    const newLocation = movement.type === 'salida' ? movement.destination : 'Bodega';
    
    const toolRef = doc(db, COLLECTION_NAME, movement.toolId);
    await updateDoc(toolRef, {
        estado: newStatus,
        ubicacion: newLocation,
        updatedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding movement:', error);
    throw error;
  }
};

export const getMovements = async (limitCount = 10): Promise<Movement[]> => {
  try {
    const q = query(
      collection(db, MOVEMENTS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Movement));
  } catch (error) {
    console.error('Error getting movements:', error);
    throw error;
  }
};

export const getMaintenanceAlerts = async (): Promise<Tool[]> => {
  try {
    const today = Date.now();
    const sevenDaysFromNow = today + (7 * 24 * 60 * 60 * 1000);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('nextMaintenanceDate', '<=', sevenDaysFromNow),
      orderBy('nextMaintenanceDate', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
    } as Tool));
  } catch (error) {
    console.error('Error getting maintenance alerts:', error);
    return [];
  }
};

export const getDashboardStats = async () => {
  const tools = await getTools();
  const movements = await getMovements(5);
  const maintenanceAlerts = tools.filter(t => t.nextMaintenanceDate && t.nextMaintenanceDate <= (Date.now() + 7 * 24 * 60 * 60 * 1000));

  const stats = {
    total: tools.length,
    disponible: tools.filter(t => t.estado === 'disponible').length,
    en_uso: tools.filter(t => t.estado === 'en_uso').length,
    mantenimiento: tools.filter(t => t.estado === 'mantenimiento').length,
    byCategory: tools.reduce((acc, tool) => {
      acc[tool.categoria] = (acc[tool.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return { stats, movements, maintenanceAlerts };
};

// ==================== EDICIÓN DE HERRAMIENTAS ====================

export const updateTool = async (id: string, data: Partial<ToolFormData>): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {};
    
    // Update fields
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.categoria) updateData.categoria = data.categoria;
    if (data.ubicacion) updateData.ubicacion = data.ubicacion;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.estado) updateData.estado = data.estado;
    if (data.imagenUrl !== undefined) updateData.imagenUrl = data.imagenUrl;
    
    if (data.nextMaintenanceDate) {
      updateData.nextMaintenanceDate = new Date(data.nextMaintenanceDate).getTime();
    }
    
    updateData.updatedAt = Date.now();
    
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating tool:', error);
    throw error;
  }
};

// ==================== MANTENIMIENTOS ====================

export const addMaintenanceRecord = async (maintenance: Omit<MaintenanceRecord, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, MAINTENANCE_COLLECTION), {
      ...maintenance,
      createdAt: Date.now()
    });

    // Actualizar la próxima fecha de mantenimiento en la herramienta
    if (maintenance.nextMaintenanceDate) {
      const toolRef = doc(db, COLLECTION_NAME, maintenance.toolId);
      await updateDoc(toolRef, {
        nextMaintenanceDate: maintenance.nextMaintenanceDate,
        updatedAt: Date.now()
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    throw error;
  }
};

export const getMaintenanceRecords = async (toolId: string): Promise<MaintenanceRecord[]> => {
  try {
    const q = query(
      collection(db, MAINTENANCE_COLLECTION),
      where('toolId', '==', toolId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MaintenanceRecord));
  } catch (error) {
    console.error('Error getting maintenance records:', error);
    return [];
  }
};
