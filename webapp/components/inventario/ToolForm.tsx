'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToolFormData, ToolStatus } from '@/types/inventory';
import { addTool } from '@/lib/firebase/tools';
import { getNextCode } from '@/lib/firebase/sequences';

export default function ToolForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<ToolFormData>({
    nombre: '',
    codigo: '',
    categoria: '',
    estado: 'disponible',
    ubicacion: 'Bodega',
    descripcion: '',
    imagenUrl: '',
    nextMaintenanceDate: '',
  });

  useEffect(() => {
    // Only generate if empty (new form)
    if (!formData.codigo) {
        const fetchCode = async () => {
            try {
                const nextCode = await getNextCode('HER', 'herramientas');
                setFormData(prev => ({ ...prev, codigo: nextCode }));
            } catch (error) {
                console.error("Failed to generate code", error);
            }
        };
        fetchCode();
    }
  }, []);

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imagenUrl: url });
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addTool(formData);
      alert('Herramienta registrada con éxito');
      router.push('/inventario');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar la herramienta');
    } finally {
      setLoading(false);
    }
  };

  return (
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

        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
                required
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 placeholder:text-gray-400 text-gray-900 bg-gray-50 font-medium"
                placeholder="Generando..."
            />
             <button 
                type="button" 
                onClick={async () => {
                    const code = await getNextCode('HER', 'herramientas');
                    setFormData({...formData, codigo: code});
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800"
            >
                Regenerar
            </button>
          </div>
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
            Estado Inicial
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
          disabled={loading}
          className="flex-1 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            'Registrar Herramienta'
          )}
        </button>
      </div>
    </form>
  );
}
