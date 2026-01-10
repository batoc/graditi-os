'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToolById, updateTool } from '@/lib/firebase/tools';
import { Tool, ToolFormData, ToolStatus } from '@/types/inventory';
import Navbar from '@/components/layout/Navbar';

export default function EditarHerramientaPage() {
  const params = useParams();
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<ToolFormData>({
    nombre: '',
    codigo: '',
    categoria: '',
    estado: 'disponible',
    ubicacion: '',
    descripcion: '',
    imagenUrl: '',
    nextMaintenanceDate: '',
  });

  useEffect(() => {
    loadTool();
  }, []);

  const loadTool = async () => {
    try {
      const id = params.id as string;
      const data = await getToolById(id);
      if (data) {
        setTool(data);
        setFormData({
          nombre: data.nombre,
          codigo: data.codigo,
          categoria: data.categoria,
          estado: data.estado,
          ubicacion: data.ubicacion,
          descripcion: data.descripcion || '',
          imagenUrl: data.imagenUrl || '',
          nextMaintenanceDate: data.nextMaintenanceDate 
            ? new Date(data.nextMaintenanceDate).toISOString().split('T')[0]
            : '',
        });
        if (data.imagenUrl) {
          setImagePreview(data.imagenUrl);
        }
      }
    } catch (error) {
      console.error('Error loading tool:', error);
      alert('Error al cargar la herramienta');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imagenUrl: url });
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool) return;

    setSaving(true);
    try {
      await updateTool(tool.id, formData);
      alert('Herramienta actualizada con éxito');
      router.push(`/inventario/${tool.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la herramienta');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Herramienta no encontrada</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Herramienta</h1>
          <p className="text-gray-500 mt-1">Código: {tool.codigo}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de la Herramienta (URL)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.imagenUrl || ''}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="block w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 placeholder:text-gray-400 text-gray-900 bg-white font-medium"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pega el enlace de una imagen externa</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 placeholder:text-gray-400 text-gray-900 bg-white font-medium"
                  placeholder="Ej: Taladro Percutor"
                />
              </div>

              {/* Código (solo lectura) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código (No editable)
                </label>
                <input
                  disabled
                  type="text"
                  value={formData.codigo}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-mono font-semibold cursor-not-allowed"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 bg-white font-medium appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-400">Seleccionar...</option>
                  <option value="electrica" className="text-gray-900">Eléctrica</option>
                  <option value="manual" className="text-gray-900">Manual</option>
                  <option value="medicion" className="text-gray-900">Medición</option>
                  <option value="seguridad" className="text-gray-900">Seguridad</option>
                  <option value="corte" className="text-gray-900">Corte</option>
                  <option value="otros" className="text-gray-900">Otros</option>
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as ToolStatus })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 bg-white font-medium appearance-none cursor-pointer"
                >
                  <option value="disponible" className="text-gray-900">Disponible</option>
                  <option value="en_uso" className="text-gray-900">En Uso</option>
                  <option value="mantenimiento" className="text-gray-900">Mantenimiento</option>
                  <option value="baja" className="text-gray-900">Baja</option>
                </select>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 placeholder:text-gray-400 text-gray-900 bg-white font-medium"
                  placeholder="Ej: Bodega Principal"
                />
              </div>

              {/* Próximo Mantenimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Próximo Mantenimiento
                </label>
                <input
                  type="date"
                  value={formData.nextMaintenanceDate}
                  onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 bg-white font-medium"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none placeholder:text-gray-400 text-gray-900 bg-white font-medium"
                placeholder="Detalles adicionales sobre la herramienta..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
