import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MovimientoMaterial, Material } from '@/types/inventory';

/**
 * Get all material movements (salidas) sent to a specific obra
 * Returns aggregated materials with total quantities and their actual units
 */
export const getMaterialesPorObra = async (obraId: string): Promise<{ nombre: string; cantidad: number; unidad: string }[]> => {
    try {
        const q = query(
            collection(db, 'movimientos_materiales'),
            where('obraId', '==', obraId),
            where('tipo', '==', 'salida')
        );
        
        const querySnapshot = await getDocs(q);
        const movimientos = querySnapshot.docs.map(doc => doc.data() as MovimientoMaterial);
        
        // Aggregate by material ID to get accurate units
        const materialesMap = new Map<string, { nombre: string; cantidad: number; unidad: string }>();
        
        for (const mov of movimientos) {
            const existing = materialesMap.get(mov.materialId);
            
            if (existing) {
                existing.cantidad += mov.cantidad;
            } else {
                // Fetch the material to get the correct unit
                let unidad = 'unidad'; // default
                try {
                    const materialDoc = await getDoc(doc(db, 'materiales', mov.materialId));
                    if (materialDoc.exists()) {
                        const materialData = materialDoc.data() as Material;
                        unidad = materialData.unidad;
                    }
                } catch (e) {
                    console.warn('Could not fetch material unit for', mov.materialId);
                }
                
                materialesMap.set(mov.materialId, {
                    nombre: mov.materialNombre,
                    cantidad: mov.cantidad,
                    unidad: unidad
                });
            }
        }
        
        // Convert to array and sort by name
        return Array.from(materialesMap.values())
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
            
    } catch (error) {
        console.error('Error getting materiales por obra:', error);
        return [];
    }
};
