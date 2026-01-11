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
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Obra, ObraFormData } from '@/types/inventory';

const COLLECTION_NAME = 'obras';

export const addObra = async (data: ObraFormData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      nombre: data.nombre,
      codigo: data.codigo,
      cliente: data.cliente || '',
      ubicacion: data.ubicacion,
      latitud: data.latitud ? parseFloat(data.latitud) : null,
      longitud: data.longitud ? parseFloat(data.longitud) : null,
      estado: data.estado,
      fechaInicio: new Date(data.fechaInicio).getTime(),
      fechaFin: data.fechaFin ? new Date(data.fechaFin).getTime() : null,
      descripcion: data.descripcion || '',
      createdAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding obra:', error);
    throw error;
  }
};

export const getObras = async (): Promise<Obra[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Obra));
  } catch (error) {
    console.error('Error getting obras:', error);
    throw error;
  }
};

export const getObrasActivas = async (): Promise<Obra[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('estado', '==', 'activa')
    );
    const querySnapshot = await getDocs(q);
    const obras = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Obra));
    
    // Ordenar en memoria
    return obras.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error getting obras activas:', error);
    throw error;
  }
};

export const getObraById = async (id: string): Promise<Obra | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Obra;
    }
    return null;
  } catch (error) {
    console.error('Error getting obra:', error);
    throw error;
  }
};

export const updateObra = async (id: string, data: Partial<ObraFormData>): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {};
    
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.codigo) updateData.codigo = data.codigo;
    if (data.cliente) updateData.cliente = data.cliente;
    if (data.ubicacion) updateData.ubicacion = data.ubicacion;
    if (data.latitud) updateData.latitud = parseFloat(data.latitud);
    if (data.longitud) updateData.longitud = parseFloat(data.longitud);
    if (data.estado) updateData.estado = data.estado;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    
    if (data.fechaInicio) {
      updateData.fechaInicio = new Date(data.fechaInicio).getTime();
    }
    if (data.fechaFin) {
      updateData.fechaFin = new Date(data.fechaFin).getTime();
    }
    
    updateData.updatedAt = Date.now();
    
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating obra:', error);
    throw error;
  }
};

export const deleteObra = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting obra:', error);
    throw error;
  }
};
