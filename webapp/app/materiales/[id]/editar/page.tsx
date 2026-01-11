'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { getMaterialById, updateMaterial } from '@/lib/firebase/materials';
import { MaterialFormData } from '@/types/inventory';
import { useAuth } from '@/lib/useAuth';

export default function EditarMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<MaterialFormData>({
    nombre: '',
    codigo: '',
    categoria: '',
    unidad: '',
    cantidadMinima: '',
    cantidadInicial: '0', // Not used for edit, but needed for type
    descripcion: '',
    ubicacion: '',
    precioUnitario: ''
  });

  useEffect(() => {
    loadMaterial();
  }, [params.id]);

  const loadMaterial = async () => {
    try {
      const id = params.id as string;
      const material = await getMaterialById(id);
      
      if (material) {
        setFormData({
          nombre: material.nombre,
          codigo: material.codigo,
          categoria: material.categoria,
          unidad: material.unidad,
          cantidadMinima: material.cantidadMinima.toString(),
          cantidadInicial: '0',
          descripcion: material.descripcion || '',
          ubicacion: material.ubicacion || '',
          precioUnitario: material.precioUnitario?.toString() || ''
        });
      } else {
        alert("Material no encontrado");
        router.push('/materiales');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const id = params.id as string;
      await updateMaterial(id, formData);
      router.push(`/materiales/${id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el material');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Material</h1>
          <p className="text-gray-500 mt-1">Actualizar información de {formData.nombre}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Código */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Código *</label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Consumibles">Consumibles</option>
                <option value="Ferretería">Ferretería</option>
                <option value="Eléctricos">Eléctricos</option>
                <option value="EPP">EPP (Protección)</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad *</label>
              <input
                 type="text"
                 required
                 value={formData.unidad}
                 onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

             {/* Cantidad Mínima */}
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                min="0"
                value={formData.cantidadMinima}
                onChange={(e) => setFormData({ ...formData, cantidadMinima: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Precio Unitario Referencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Unitario (Ref)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.precioUnitario}
                onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Ubicación */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación Bodega</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

             {/* Descripción */}
             <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}