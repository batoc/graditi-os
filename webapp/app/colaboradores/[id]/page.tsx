'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getColaboradorById, deleteColaborador } from '@/lib/firebase/colaboradores';
import { getPrestamosPorColaborador } from '@/lib/firebase/prestamos';
import { Colaborador, Prestamo } from '@/types/inventory';

export default function ColaboradorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const id = params.id as string;
      const [colData, prestamosData] = await Promise.all([
        getColaboradorById(id),
        getPrestamosPorColaborador(id)
      ]);
      setColaborador(colData);
      setPrestamos(prestamosData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!colaborador || !confirm('¿Estás seguro de eliminar este colaborador?')) return;

    try {
      await deleteColaborador(colaborador.id);
      alert('Colaborador eliminado');
      router.push('/colaboradores');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el colaborador');
    }
  };

  const handleNuevoPrestamo = () => {
    // Redirige a salida con el colaborador pre-seleccionado
    router.push(`/prestamos/salida?colaboradorId=${colaborador?.id}`);
  };

  const prestamosActivos = prestamos.filter(p => p.estado === 'activo' || p.estado === 'parcial');
  const prestamosHistoricos = prestamos.filter(p => p.estado === 'devuelto');

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
          <Link href="/colaboradores" className="text-red-700 hover:underline mt-4 inline-block">
            Volver a colaboradores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <Link
              href="/colaboradores"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/colaboradores/${colaborador.id}/editar`}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                ✏️ Editar
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>

          <div className="flex items-start gap-6">
            {/* Foto */}
            <div className="w-32 h-32 bg-gradient-to-br from-red-700 to-red-900 rounded-full flex items-center justify-center overflow-hidden">
              {colaborador.fotoUrl ? (
                <img src={colaborador.fotoUrl} alt={colaborador.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-5xl font-bold">
                  {colaborador.nombre.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{colaborador.nombre}</h1>
              <p className="text-lg text-gray-600 mt-1">{colaborador.cargo}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span>CC: {colaborador.cedula}</span>
                </div>
                {colaborador.telefono && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{colaborador.telefono}</span>
                  </div>
                )}
                {colaborador.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{colaborador.email}</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  colaborador.estado === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {colaborador.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Préstamos Activos */}
            {prestamosActivos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-gray-900">
                    Préstamos Activos ({prestamosActivos.length})
                  </h2>
                  <button
                    onClick={handleNuevoPrestamo}
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium text-sm"
                  >
                    + Nuevo Préstamo
                  </button>
                </div>

                <div className="space-y-3">
                  {prestamosActivos.map((prestamo) => (
                    <Link
                      key={prestamo.id}
                      href={`/prestamos/${prestamo.id}`}
                      className="block p-4 bg-amber-50 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{prestamo.obraNombre}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(prestamo.fechaSalida).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          prestamo.estado === 'activo' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {prestamo.estado === 'activo' ? 'Activo' : 'Parcial'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{prestamo.herramientas.length}</span> herramienta(s)
                        {' • '}
                        <span className="font-medium">
                          {prestamo.herramientas.filter(h => !h.devuelto).length}
                        </span> pendientes
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {prestamosActivos.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin préstamos activos</h3>
                  <p className="text-gray-600 mb-4">Este colaborador no tiene herramientas asignadas actualmente</p>
                  <button
                    onClick={handleNuevoPrestamo}
                    className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium"
                  >
                    Crear Préstamo
                  </button>
                </div>
              </div>
            )}

            {/* Historial */}
            {prestamosHistoricos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-4">
                  Historial de Préstamos ({prestamosHistoricos.length})
                </h2>
                <div className="space-y-2">
                  {prestamosHistoricos.slice(0, 5).map((prestamo) => (
                    <Link
                      key={prestamo.id}
                      href={`/prestamos/${prestamo.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{prestamo.obraNombre}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(prestamo.fechaSalida).toLocaleDateString('es-CO')} - {' '}
                            {prestamo.fechaDevolucion && new Date(prestamo.fechaDevolucion).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <span className="text-sm text-gray-600">
                          {prestamo.herramientas.length} items
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code del Carnet */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">QR Carnet</h2>
              <div className="bg-white p-4 border-2 border-gray-200 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=COL-${colaborador.cedula}`}
                  alt="QR Code Colaborador"
                  className="w-full"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Código: <span className="font-mono font-semibold">COL-{colaborador.cedula}</span>
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Escanea para ver préstamos y hoja de vida
              </p>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Estadísticas</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Préstamos</span>
                  <span className="text-lg font-bold text-gray-900">{prestamos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Activos</span>
                  <span className="text-lg font-bold text-green-700">{prestamosActivos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Devueltos</span>
                  <span className="text-lg font-bold text-gray-700">{prestamosHistoricos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Herramientas Actuales</span>
                  <span className="text-lg font-bold text-amber-700">
                    {prestamosActivos.reduce((acc, p) => acc + p.herramientas.filter(h => !h.devuelto).length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
