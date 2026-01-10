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
import { Colaborador, ColaboradorFormData } from '@/types/inventory';

const COLLECTION_NAME = 'colaboradores';

export const addColaborador = async (data: ColaboradorFormData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding colaborador:', error);
    throw error;
  }
};

export const getColaboradores = async (): Promise<Colaborador[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Colaborador));
  } catch (error) {
    console.error('Error getting colaboradores:', error);
    throw error;
  }
};

export const getColaboradoresActivos = async (): Promise<Colaborador[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('estado', '==', 'activo')
    );
    const querySnapshot = await getDocs(q);
    const colaboradores = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Colaborador));
    
    // Ordenar en memoria
    return colaboradores.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error getting colaboradores activos:', error);
    throw error;
  }
};

export const getColaboradorById = async (id: string): Promise<Colaborador | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Colaborador;
    }
    return null;
  } catch (error) {
    console.error('Error getting colaborador:', error);
    throw error;
  }
};

export const updateColaborador = async (id: string, data: Partial<ColaboradorFormData>): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      nombre: data.nombre,
      cedula: data.cedula,
      cargo: data.cargo,
      telefono: data.telefono || '',
      email: data.email || '',
      estado: data.estado,
      fotoUrl: data.fotoUrl || '',
      updatedAt: Date.now()
    };
    
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updateData);
    console.log('Colaborador actualizado exitosamente:', id);
  } catch (error) {
    console.error('Error updating colaborador:', error);
    throw error;
  }
};

export const deleteColaborador = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting colaborador:', error);
    throw error;
  }
};
