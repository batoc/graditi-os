'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { getObraById, updateObra, deleteObra } from '@/lib/firebase/obras';
import { ObraFormData } from '@/types/inventory';

export default function EditarObraPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ObraFormData>({
    codigo: '',
    nombre: '',
    ubicacion: '',
    cliente: '',
    fechaInicio: '',
    fechaFinEstimada: '',
    descripcion: '',
    estado: 'activa'
  });

  useEffect(() => {
    loadObra();
  }, [params.id]);

  const loadObra = async () => {
    try {
      const id = params.id as string;
      const obra = await getObraById(id);
      
      if (obra) {
        setFormData({
          codigo: obra.codigo,
          nombre: obra.nombre,
          ubicacion: obra.ubicacion,
          cliente: obra.cliente,
          fechaInicio: obra.fechaInicio,
          fechaFinEstimada: obra.fechaFinEstimada || '',
          descripcion: obra.descripcion || '',
          estado: obra.estado
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const id = params.id as string;
      await updateObra(id, formData);
      router.push(`/obras/${id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la obra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta obra? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const id = params.id as string;
      await deleteObra(id);
      router.push('/obras');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la obra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-red-700 hover:text-red-800 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Obra</h1>
          <p className="text-gray-500 mt-1">Actualiza la información de la obra</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código *
              </label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cliente *
              </label>
              <input
                type="text"
                required
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                required
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                required
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            {/* Fecha Fin Estimada */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Fin Estimada
              </label>
              <input
                type="date"
                value={formData.fechaFinEstimada || ''}
                onChange={(e) => setFormData({ ...formData, fechaFinEstimada: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado *
              </label>
              <select
                required
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'activa' | 'pausada' | 'finalizada' })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              >
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 disabled:bg-gray-400 font-medium"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              Cancelar
            </button>
          </div>

          {/* Delete Button */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Eliminar Obra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
