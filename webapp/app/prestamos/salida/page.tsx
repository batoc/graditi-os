'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MultiScanner from '@/components/prestamos/MultiScanner';
import { getColaboradoresActivos } from '@/lib/firebase/colaboradores';
import { getObrasActivas } from '@/lib/firebase/obras';
import { crearPrestamoSalida } from '@/lib/firebase/prestamos';
import { Colaborador, Obra, PrestamoHerramienta } from '@/types/inventory';

export default function PrestamoSalidaPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [colaboradorId, setColaboradorId] = useState('');
  const [obraId, setObraId] = useState('');
  const [herramientas, setHerramientas] = useState<PrestamoHerramienta[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [colsData, obrasData] = await Promise.all([
        getColaboradoresActivos(),
        getObrasActivas()
      ]);
      setColaboradores(colsData);
      setObras(obrasData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!colaboradorId || !obraId || herramientas.length === 0) {
      alert('Por favor completa todos los campos y escanea al menos una herramienta');
      return;
    }

    setSaving(true);
    try {
      const colaborador = colaboradores.find(c => c.id === colaboradorId);
      const obra = obras.find(o => o.id === obraId);

      if (!colaborador || !obra) {
        alert('Error: Datos inválidos');
        return;
      }

      await crearPrestamoSalida(
        colaborador.id,
        colaborador.nombre,
        obra.id,
        obra.nombre,
        herramientas,
        'Secretaria', // TODO: Get from auth
        observaciones
      );

      alert(`✅ Préstamo registrado exitosamente\n${herramientas.length} herramienta(s) asignadas a ${colaborador.nombre}`);
      router.push('/prestamos');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar el préstamo');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📤 Salida de Herramientas</h1>
          <p className="text-gray-500 mt-1">Registra la entrega de herramientas a un colaborador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Colaborador y Obra */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Información del Préstamo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colaborador *
                </label>
                <select
                  required
                  value={colaboradorId}
                  onChange={(e) => setColaboradorId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                >
                  <option value="">Selecciona un colaborador</option>
                  {colaboradores.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.nombre} - {col.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obra/Proyecto *
                </label>
                <select
                  required
                  value={obraId}
                  onChange={(e) => setObraId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                >
                  <option value="">Selecciona una obra</option>
                  {obras.map(obra => (
                    <option key={obra.id} value={obra.id}>
                      {obra.nombre} - {obra.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none"
                  placeholder="Notas adicionales sobre el préstamo..."
                />
              </div>
            </div>
          </div>

          {/* Scanner */}
          <MultiScanner 
            herramientas={herramientas}
            onHerramientasChange={setHerramientas}
          />

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || herramientas.length === 0}
              className="flex-1 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium disabled:opacity-50"
            >
              {saving ? 'Registrando...' : `Registrar Salida (${herramientas.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
