'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getToolById, deleteTool, updateToolStatus } from '@/lib/firebase/tools';
import { Tool, ToolStatus } from '@/types/inventory';
import Navbar from '@/components/layout/Navbar';
import MaintenanceHistory from '@/components/inventario/MaintenanceHistory';

export default function ToolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTool();
  }, []);

  const loadTool = async () => {
    try {
      const id = params.id as string;
      const data = await getToolById(id);
      setTool(data);
    } catch (error) {
      console.error('Error loading tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tool || !confirm('¿Estás seguro de eliminar esta herramienta?')) return;

    try {
      await deleteTool(tool.id);
      alert('Herramienta eliminada');
      router.push('/inventario');
    } catch (error) {
      console.error('Error deleting tool:', error);
      alert('Error al eliminar la herramienta');
    }
  };

  const handleStatusChange = async (newStatus: ToolStatus) => {
    if (!tool) return;

    try {
      await updateToolStatus(tool.id, newStatus);
      setTool({ ...tool, estado: newStatus });
      alert('Estado actualizado');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
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
          <Link href="/inventario" className="text-red-700 hover:underline mt-4 inline-block">
            Volver al inventario
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    disponible: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disponible' },
    en_uso: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Uso' },
    mantenimiento: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Mantenimiento' },
    baja: { bg: 'bg-red-100', text: 'text-red-800', label: 'Baja' },
  };

  const status = statusConfig[tool.estado] || { bg: 'bg-gray-100', text: 'text-gray-800', label: tool.estado || 'Desconocido' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{tool.nombre}</h1>
            <p className="text-gray-500 font-mono mt-1">{tool.codigo}</p>
          </div>
          <Link
            href={`/inventario/${tool.id}/editar`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Editar herramienta"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Eliminar herramienta"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-96 bg-gray-100 flex items-center justify-center">
                {tool.imagenUrl ? (
                  <img src={tool.imagenUrl} alt={tool.nombre} className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Description */}
            {tool.descripcion && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">{tool.descripcion}</p>
              </div>
            )}

            {/* Mantenimientos - Hoja de Vida */}
            <MaintenanceHistory toolId={tool.id} toolCode={tool.codigo} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Estado Actual</h2>
              <div className={`px-4 py-3 rounded-lg text-center font-semibold ${status.bg} ${status.text}`}>
                {status.label}
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Cambiar estado:</p>
                {(['disponible', 'en_uso', 'mantenimiento', 'baja'] as ToolStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={tool.estado === s}
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed capitalize text-left"
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Información</h2>
              <div className="space-y-3">
                <InfoRow label="Categoría" value={tool.categoria} />
                <InfoRow label="Ubicación" value={tool.ubicacion} />
                <InfoRow
                  label="Registrado"
                  value={new Date(tool.createdAt).toLocaleDateString()}
                />
                {tool.nextMaintenanceDate && (
                  <InfoRow
                    label="Mantenimiento"
                    value={new Date(tool.nextMaintenanceDate).toLocaleDateString()}
                  />
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Código QR</h2>
              <div className="bg-white p-4 border-2 border-gray-200 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${tool.codigo}`}
                  alt="QR Code"
                  className="w-full"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Escanea para acceder rápidamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
    </div>
  );
}
