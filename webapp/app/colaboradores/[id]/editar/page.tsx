'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { getColaboradorById, updateColaborador } from '@/lib/firebase/colaboradores';
import { Colaborador, ColaboradorFormData } from '@/types/inventory';

export default function EditarColaboradorPage() {
  const params = useParams();
  const router = useRouter();
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<ColaboradorFormData>({
    nombre: '',
    cedula: '',
    cargo: '',
    telefono: '',
    email: '',
    estado: 'activo',
    fotoUrl: '',
  });

  useEffect(() => {
    loadColaborador();
  }, []);

  const loadColaborador = async () => {
    try {
      const id = params.id as string;
      const data = await getColaboradorById(id);
      if (data) {
        setColaborador(data);
        setFormData({
          nombre: data.nombre,
          cedula: data.cedula,
          cargo: data.cargo,
          telefono: data.telefono || '',
          email: data.email || '',
          estado: data.estado,
          fotoUrl: data.fotoUrl || '',
        });
        if (data.fotoUrl) {
          setImagePreview(data.fotoUrl);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar el colaborador');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, fotoUrl: url });
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaborador) return;

    setSaving(true);
    try {
      console.log('Enviando datos:', formData);
      await updateColaborador(colaborador.id, formData);
      alert('✅ Colaborador actualizado con éxito');
      router.push(`/colaboradores/${colaborador.id}`);
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error al actualizar el colaborador');
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

  if (!colaborador) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Colaborador no encontrado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Colaborador</h1>
          <p className="text-gray-500 mt-1">CC: {colaborador.cedula}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto del Colaborador (URL)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ccircle fill="%23ddd" cx="50" cy="50" r="50"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="40"%3E?%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.fotoUrl || ''}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="block w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL de foto (opcional)</p>
                </div>
              </div>
            </div>

            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  required
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula *
                </label>
                <input
                  required
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo *
                </label>
                <input
                  required
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  required
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'activo' | 'inactivo' })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
