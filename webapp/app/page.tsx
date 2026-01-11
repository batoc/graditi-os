'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/firebase/tools';
import { Tool, Movement } from '@/types/inventory';
import Navbar from '@/components/layout/Navbar';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    disponible: 0,
    en_uso: 0,
    mantenimiento: 0,
    byCategory: {} as Record<string, number>
  });
  const [movements, setMovements] = useState<Movement[]>([]);
  const [alerts, setAlerts] = useState<Tool[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
        setMovements(data.movements);
        setAlerts(data.maintenanceAlerts);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-gray-500 mt-1">Resumen general del inventario</p>
          </div>
          <div className="flex gap-3">
             <Link
              href="/inventario/nuevo"
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-sm"
            >
              + Nueva Herramienta
            </Link>
            <Link
              href="/movimientos"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm shadow-blue-200"
            >
              Registrar Movimiento
            </Link>
            <Link
              href="/seed"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm shadow-purple-200"
            >
              Datos de Prueba
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Herramientas" 
            value={stats.total} 
            icon={<ArchiveIcon />} 
            color="bg-white" 
          />
          <StatCard 
            title="Disponibles" 
            value={stats.disponible} 
            icon={<CheckCircleIcon />} 
            color="bg-green-50 border-green-100 text-green-700" 
            textColor="text-green-700"
          />
          <StatCard 
            title="En Uso" 
            value={stats.en_uso} 
            icon={<ClockIcon />} 
            color="bg-blue-50 border-blue-100 text-blue-700" 
            textColor="text-blue-700"
          />
          <StatCard 
            title="En Mantenimiento" 
            value={stats.mantenimiento} 
            icon={<WrenchIcon />} 
            color="bg-amber-50 border-amber-100 text-amber-700" 
            textColor="text-amber-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Inventario por Categoría</h2>
            <div className="space-y-4">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{category}</span>
                    <span className="text-gray-500">{count} unidades</span>
                  </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-red-700 h-2.5 rounded-full" 
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {Object.keys(stats.byCategory).length === 0 && (
                <p className="text-gray-400 text-sm">No hay datos de categorías disponibles.</p>
              )}
            </div>
          </div>

          {/* Alerts Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExclamationIcon />
              Próximos Mantenimientos
            </h2>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                 <div className="text-center py-8 text-gray-500 text-sm">
                   Todo en orden. No hay mantenimientos próximos.
                 </div>
              ) : (
                alerts.map(tool => (
                  <div key={tool.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="mt-1 min-w-4 w-4 h-4 rounded-full bg-red-200 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tool.nombre}</p>
                      <p className="text-xs text-red-700 mt-0.5">
                        Vence: {new Date(tool.nextMaintenanceDate!).toLocaleDateString()}
                      </p>
                      <Link href={`/inventario/${tool.id}`} className="text-xs text-red-600 underline hover:text-red-800 mt-1 block">
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Movimientos Recientes</h2>
            <Link href="/movimientos" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tipo</th>
                  <th className="px-6 py-3 font-semibold">Herramienta</th>
                  <th className="px-6 py-3 font-semibold">Responsable</th>
                  <th className="px-6 py-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((mov) => (
                  <tr key={mov.id}>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                        mov.type === 'salida' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">{mov.toolCode}</td>
                    <td className="px-6 py-3">{mov.responsible}</td>
                    <td className="px-6 py-3 text-gray-500">{new Date(mov.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No hay movimientos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}

// Simple Components for Icons & Cards
function StatCard({ title, value, icon, color, textColor = 'text-gray-900' }: any) {
  return (
    <div className={`p-6 rounded-xl shadow-sm border ${color.includes('bg-') ? '' : 'bg-white'} border-gray-100 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${textColor}`}>{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${color === 'bg-white' ? 'bg-gray-100 text-gray-600' : 'bg-white/50'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const ArchiveIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
);
const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const WrenchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ExclamationIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
