'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getObraById } from '@/lib/firebase/obras';
import { getPrestamosPorObra } from '@/lib/firebase/prestamos';
import { Obra, Prestamo } from '@/types/inventory';

export default function ObraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [obra, setObra] = useState<Obra | null>(null);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const id = params.id as string;
      const [obraData, prestamosData] = await Promise.all([
        getObraById(id),
        getPrestamosPorObra(id)
      ]);
      
      setObra(obraData);
      setPrestamos(prestamosData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  if (!obra) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-gray-500">Obra no encontrada</p>
        </div>
      </div>
    );
  }

  const prestamosActivos = prestamos.filter(p => p.estado === 'activo');
  const herramientasActivas = prestamosActivos.reduce((total, p) => 
    total + p.herramientas.filter(h => h.estado === 'en_uso').length, 0
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'pausada':
        return 'bg-amber-100 text-amber-800';
      case 'finalizada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{obra.nombre}</h1>
              <p className="text-gray-500 mt-1">{obra.codigo}</p>
            </div>
            <Link
              href={`/obras/${obra.id}/editar`}
              className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 font-medium"
            >
              Editar Obra
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Información</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Estado</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getEstadoBadge(obra.estado)}`}>
                      {obra.estado}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Cliente</label>
                  <p className="font-semibold text-gray-900">{obra.cliente}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Ubicación</label>
                  <p className="font-semibold text-gray-900">{obra.ubicacion}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Fecha de Inicio</label>
                  <p className="font-semibold text-gray-900">
                    {new Date(obra.fechaInicio).toLocaleDateString('es-CO')}
                  </p>
                </div>
                
                {obra.fechaFinEstimada && (
                  <div>
                    <label className="text-sm text-gray-500">Fecha Fin Estimada</label>
                    <p className="font-semibold text-gray-900">
                      {new Date(obra.fechaFinEstimada).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                )}
                
                {obra.descripcion && (
                  <div>
                    <label className="text-sm text-gray-500">Descripción</label>
                    <p className="text-gray-900">{obra.descripcion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Estadísticas</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Herramientas Actuales</span>
                  <span className="font-bold text-2xl text-red-700">{herramientasActivas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Préstamos Activos</span>
                  <span className="font-bold text-2xl text-purple-700">{prestamosActivos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Préstamos</span>
                  <span className="font-bold text-2xl text-gray-700">{prestamos.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Préstamos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Préstamos Activos</h2>
                <Link
                  href="/prestamos/salida"
                  className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 text-sm font-medium"
                >
                  Nuevo Préstamo
                </Link>
              </div>

              {prestamosActivos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay préstamos activos</p>
              ) : (
                <div className="space-y-4">
                  {prestamosActivos.map((prestamo) => (
                    <div
                      key={prestamo.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {prestamo.colaboradorNombre}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(prestamo.fechaSalida).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <Link
                          href={`/prestamos/${prestamo.id}`}
                          className="text-red-700 hover:text-red-800 text-sm font-medium"
                        >
                          Ver detalles →
                        </Link>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Herramientas ({prestamo.herramientas.filter(h => h.estado === 'en_uso').length})
                        </p>
                        <div className="space-y-1">
                          {prestamo.herramientas
                            .filter(h => h.estado === 'en_uso')
                            .slice(0, 3)
                            .map((h, idx) => (
                              <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                {h.nombre} ({h.codigo})
                              </div>
                            ))}
                          {prestamo.herramientas.filter(h => h.estado === 'en_uso').length > 3 && (
                            <p className="text-sm text-gray-500 italic">
                              +{prestamo.herramientas.filter(h => h.estado === 'en_uso').length - 3} más
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historial */}
            {prestamos.filter(p => p.estado === 'finalizado').length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Historial de Préstamos</h2>
                <div className="space-y-3">
                  {prestamos
                    .filter(p => p.estado === 'finalizado')
                    .slice(0, 5)
                    .map((prestamo) => (
                      <div
                        key={prestamo.id}
                        className="border-l-4 border-gray-300 pl-4 py-2"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{prestamo.colaboradorNombre}</p>
                            <p className="text-sm text-gray-500">
                              {prestamo.herramientas.length} herramienta(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {new Date(prestamo.fechaSalida).toLocaleDateString('es-CO')}
                            </p>
                            {prestamo.fechaDevolucion && (
                              <p className="text-xs text-gray-500">
                                Dev: {new Date(prestamo.fechaDevolucion).toLocaleDateString('es-CO')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
