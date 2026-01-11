'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { addObra } from '@/lib/firebase/obras';
import { getNextCode } from '@/lib/firebase/sequences';
import { ObraFormData } from '@/types/inventory';

export default function NuevaObraPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ObraFormData>({
    codigo: '',
    nombre: '',
    ubicacion: '',
    cliente: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    descripcion: '',
    estado: 'activa'
  });

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const nextCode = await getNextCode('OBR', 'obras');
        setFormData(prev => ({ ...prev, codigo: nextCode }));
      } catch (error) {
        console.error("Failed to generate code", error);
      }
    };
    fetchCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addObra(formData);
      router.push('/obras');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la obra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nueva Obra</h1>
          <p className="text-gray-500 mt-1">Registra una nueva obra o proyecto</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código *
              </label>
              <div className="relative">
                <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 bg-gray-50"
                    placeholder="Generando..."
                />
                 <button 
                    type="button" 
                    onClick={async () => {
                        const code = await getNextCode('OBR', 'obras');
                        setFormData({...formData, codigo: code});
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800"
                >
                    Regenerar
                </button>
              </div>
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
                placeholder="Edificio Torres del Parque"
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
                placeholder="Constructora ABC S.A.S."
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dirección / Ubicación *
              </label>
              <input
                type="text"
                required
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                placeholder="Calle 123 # 45-67"
              />
            </div>
            
            {/* Coordenadas */}
            <div className="col-span-full bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Geolocalización (Mapa)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Latitud</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.latitud || ''}
                            onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                            placeholder="Ej: 4.60971"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Longitud</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.longitud || ''}
                            onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                            placeholder="Ej: -74.08175"
                        />
                    </div>
                    <div className="col-span-full">
                        <p className="text-xs text-blue-700">
                           Tip: Puedes copiar las coordenadas desde Google Maps (clic derecho en el mapa &gt; copiar coordenadas) y pegarlas aquí.
                           Si pegas "4.60, -74.08" en el campo de latitud, intentaré separarlas automáticamente.
                        </p>
                    </div>
                </div>
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

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Fin Estimada
              </label>
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
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
                placeholder="Descripción del proyecto..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Guardando...' : 'Crear Obra'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
