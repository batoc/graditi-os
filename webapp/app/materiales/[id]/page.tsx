'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { getMaterialById, getMaterialMovements, registrarMovimientoMaterial } from '@/lib/firebase/materials';
import { getObrasActivas } from '@/lib/firebase/obras'; 
import { Material, MovimientoMaterial, Obra } from '@/types/inventory';
import { useAuth } from '@/lib/useAuth';

export default function DetalleMaterialPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();

  const [material, setMaterial] = useState<Material | null>(null);
  const [movements, setMovements] = useState<MovimientoMaterial[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'entrada' | 'salida'>('salida');
  const [qty, setQty] = useState('');
  const [selectedObra, setSelectedObra] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    loadObras();
  }, [id]);

  const loadData = async () => {
    try {
      const [mat, movs] = await Promise.all([
        getMaterialById(id),
        getMaterialMovements(id)
      ]);
      setMaterial(mat);
      setMovements(movs);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadObras = async () => {
      try {
          const data = await getObrasActivas();
          setObras(data);
      } catch (e) { console.error(e); }
  }

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material || !user) return;
    
    setSubmitting(true);
    try {
        const cantidad = Number(qty);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Cantidad inválida");
            return;
        }

        const movimiento: MovimientoMaterial = {
            materialId: material.id,
            materialNombre: material.nombre,
            tipo: modalType,
            cantidad: cantidad,
            observaciones: notes,
            usuarioId: user.uid,
            fecha: Date.now()
        };

        if (modalType === 'salida') {
            if (selectedObra) {
                const obra = obras.find(o => o.id === selectedObra);
                movimiento.obraId = selectedObra;
                movimiento.obraNombre = obra?.nombre || 'Desconocida';
            }
        }

        await registrarMovimientoMaterial(movimiento);
        
        // Reset and reload
        setShowModal(false);
        setQty('');
        setNotes('');
        setSelectedObra('');
        await loadData(); // Reload to see new stock
    } catch(err: any) {
        console.error(err);
        alert("Error: " + err.message);
    } finally {
        setSubmitting(false);
    }
  }

  if (loading) return <div className="p-10 text-center">Cargando...</div>;
  if (!material) return <div className="p-10 text-center">Material no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {/* Breadcrumb */}
         <div className="mb-6 flex items-center text-sm text-gray-500">
             <Link href="/materiales" className="hover:text-blue-600">Materiales</Link>
             <span className="mx-2">/</span>
             <span className="font-medium text-gray-900">{material.nombre}</span>
         </div>

         {/* Header Card */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{material.nombre}</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {material.codigo}
                        </span>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Cat: {material.categoria}</span>
                        <span>•</span>
                        <span>Ubicación: {material.ubicacion || 'N/A'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Disponible</p>
                        <p className={`text-3xl font-bold ${material.cantidadDisponible <= material.cantidadMinima ? 'text-red-600' : 'text-green-600'}`}>
                            {material.cantidadDisponible} <span className="text-sm text-gray-500 font-normal">{material.unidad}</span>
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <button 
                           onClick={() => { setModalType('entrada'); setShowModal(true); }}
                           className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                        >
                            + Entrada
                        </button>
                        <button 
                           onClick={() => { setModalType('salida'); setShowModal(true); }}
                           className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                        >
                            - Salida / Enviar a Obra
                        </button>
                    </div>
                </div>
            </div>
            
            {material.descripcion && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-600 text-sm">{material.descripcion}</p>
                </div>
            )}
         </div>

         {/* History */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900">Historial de Movimientos</h3>
             </div>
             <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                     <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino / Obs</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200 bg-white">
                     {movements.map(mov => (
                         <tr key={mov.id}>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                 {new Date(mov.fecha).toLocaleDateString()} {new Date(mov.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm">
                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                     mov.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                 }`}>
                                     {mov.tipo.toUpperCase()}
                                 </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                 {mov.cantidad}
                             </td>
                             <td className="px-6 py-4 text-sm text-gray-500">
                                 {mov.obraNombre && <span className="font-medium text-blue-600 block">{mov.obraNombre}</span>}
                                 {mov.observaciones || '-'}
                             </td>
                         </tr>
                     ))}
                     {movements.length === 0 && (
                         <tr>
                             <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                 No hay movimientos registrados.
                             </td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>

         {/* Modal */}
         {showModal && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                 <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                     <h2 className="text-xl font-bold text-gray-900 mb-4">
                         Registrar {modalType === 'entrada' ? 'Entrada' : 'Salida'}
                     </h2>
                     <form onSubmit={handleTransaction}>
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                     Cantidad ({material.unidad})
                                 </label>
                                 <input 
                                     type="number" 
                                     required 
                                     min="0.01"
                                     step="any"
                                     value={qty}
                                     onChange={(e) => setQty(e.target.value)}
                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                     autoFocus
                                 />
                             </div>

                             {modalType === 'salida' && (
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">
                                         Destino (Obra) - Opcional
                                     </label>
                                     <select 
                                         value={selectedObra}
                                         onChange={(e) => setSelectedObra(e.target.value)}
                                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                     >
                                         <option value="">Seleccione obra (opcional)</option>
                                         {obras.map(obra => (
                                             <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                                         ))}
                                     </select>
                                 </div>
                             )}

                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                     Observaciones
                                 </label>
                                 <textarea 
                                     rows={2}
                                     value={notes}
                                     onChange={(e) => setNotes(e.target.value)}
                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                     placeholder="Nro factura, nombre persona, etc."
                                 />
                             </div>
                         </div>

                         <div className="mt-6 flex justify-end gap-3">
                             <button 
                                 type="button"
                                 onClick={() => setShowModal(false)}
                                 className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                             >
                                 Cancelar
                             </button>
                             <button 
                                 type="submit"
                                 disabled={submitting}
                                 className={`px-4 py-2 text-white rounded-md font-medium ${
                                     modalType === 'entrada' 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-red-600 hover:bg-red-700'
                                 } ${submitting ? 'opacity-50' : ''}`}
                             >
                                 {submitting ? 'Procesando...' : 'Confirmar'}
                             </button>
                         </div>
                     </form>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
}
