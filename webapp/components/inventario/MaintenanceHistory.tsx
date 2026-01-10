'use client';

import { useState, useEffect } from 'react';
import { MaintenanceRecord } from '@/types/inventory';
import { getMaintenanceRecords, addMaintenanceRecord } from '@/lib/firebase/tools';

interface MaintenanceHistoryProps {
  toolId: string;
  toolCode: string;
}

export default function MaintenanceHistory({ toolId, toolCode }: MaintenanceHistoryProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: 'preventivo',
    description: '',
    cost: '',
    technician: '',
    date: new Date().toISOString().split('T')[0],
    nextMaintenanceDate: '',
  });

  useEffect(() => {
    loadRecords();
  }, [toolId]);

  const loadRecords = async () => {
    try {
      const data = await getMaintenanceRecords(toolId);
      setRecords(data);
    } catch (error) {
      console.error('Error loading maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const maintenance: Omit<MaintenanceRecord, 'id' | 'createdAt'> = {
        toolId,
        toolCode,
        type: formData.type,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        technician: formData.technician,
        date: new Date(formData.date).getTime(),
        nextMaintenanceDate: formData.nextMaintenanceDate 
          ? new Date(formData.nextMaintenanceDate).getTime() 
          : undefined,
        createdBy: 'admin', // TODO: Get from auth context
      };

      await addMaintenanceRecord(maintenance);
      alert('Mantenimiento registrado con éxito');
      setShowForm(false);
      setFormData({
        type: 'preventivo',
        description: '',
        cost: '',
        technician: '',
        date: new Date().toISOString().split('T')[0],
        nextMaintenanceDate: '',
      });
      loadRecords();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar el mantenimiento');
    } finally {
      setSaving(false);
    }
  };

  const maintenanceTypes: Record<string, { label: string; color: string }> = {
    preventivo: { label: 'Preventivo', color: 'bg-blue-100 text-blue-800' },
    correctivo: { label: 'Correctivo', color: 'bg-red-100 text-red-800' },
    calibracion: { label: 'Calibración', color: 'bg-purple-100 text-purple-800' },
    revision: { label: 'Revisión', color: 'bg-green-100 text-green-800' },
    limpieza: { label: 'Limpieza', color: 'bg-gray-100 text-gray-800' },
    reparacion: { label: 'Reparación', color: 'bg-orange-100 text-orange-800' },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg text-gray-900">Historial de Mantenimientos</h2>
          <p className="text-sm text-gray-500 mt-1">Hoja de vida de la herramienta</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium text-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Mantenimiento
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Mantenimiento *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 bg-white font-medium"
                >
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="calibracion">Calibración</option>
                  <option value="revision">Revisión</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="reparacion">Reparación</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Técnico Responsable *
                </label>
                <input
                  required
                  type="text"
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 placeholder:text-gray-400 text-gray-900 bg-white font-medium"
                  placeholder="Nombre del técnico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 placeholder:text-gray-400 text-gray-900 bg-white font-medium"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Trabajo *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none placeholder:text-gray-400 text-gray-900 bg-white font-medium"
                  placeholder="Detalle del mantenimiento realizado..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Próximo Mantenimiento (opcional)
                </label>
                <input
                  type="date"
                  value={formData.nextMaintenanceDate}
                  onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 bg-white font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No hay registros de mantenimiento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${maintenanceTypes[record.type]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {maintenanceTypes[record.type]?.label || record.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString('es-CO', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  {record.cost && (
                    <span className="text-sm font-semibold text-gray-900">
                      ${record.cost.toLocaleString('es-CO')}
                    </span>
                  )}
                </div>

                <p className="text-gray-900 mb-2">{record.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{record.technician}</span>
                  </div>
                  {record.nextMaintenanceDate && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Próximo: {new Date(record.nextMaintenanceDate).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
