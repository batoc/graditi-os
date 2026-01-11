'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { addMaterial } from '@/lib/firebase/materials';
import { MaterialFormData } from '@/types/inventory';
import { useAuth } from '@/lib/useAuth';

export default function NuevoMaterialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MaterialFormData>({
    nombre: '',
    codigo: '',
    categoria: '',
    unidad: '',
    cantidadMinima: '5',
    cantidadInicial: '0',
    descripcion: '',
    ubicacion: '',
    precioUnitario: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        alert("Debes estar autenticado para crear materiales");
        return;
    }

    setLoading(true);

    try {
      await addMaterial(formData, user.uid);
      router.push('/materiales');
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al crear el material: ' + (error.message || 'Desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Material</h1>
          <p className="text-gray-500 mt-1">Registra un nuevo tipo de material o insumo.</p>
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
                placeholder="MAT-001"
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
                placeholder="Cemento Gris 50kg"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad de Medida *</label>
              <input
                 type="text"
                 required
                 list="unidades"
                 value={formData.unidad}
                 onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Ej: kg, m, bulto, unidad"
              />
              <datalist id="unidades">
                  <option value="unidad" />
                  <option value="kg" />
                  <option value="metros" />
                  <option value="bultos" />
                  <option value="cajas" />
                  <option value="litros" />
              </datalist>
            </div>

            {/* Cantidad Inicial */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Inicial</label>
              <input
                type="number"
                min="0"
                value={formData.cantidadInicial}
                onChange={(e) => setFormData({ ...formData, cantidadInicial: e.target.value })}
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

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación Bodega</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Estante 3, Nivel 2"
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
                placeholder="Detalles adicionales..."
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
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Guardando...' : 'Crear Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
