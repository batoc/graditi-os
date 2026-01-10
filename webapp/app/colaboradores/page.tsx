'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { getColaboradores } from '@/lib/firebase/colaboradores';
import { Colaborador } from '@/types/inventory';

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    try {
      const data = await getColaboradores();
      setColaboradores(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredColaboradores = colaboradores.filter(col =>
    col.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.cedula.includes(searchTerm) ||
    col.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Colaboradores</h1>
            <p className="text-gray-500 mt-1">Gestiona el personal de la empresa</p>
          </div>
          <Link
            href="/colaboradores/nuevo"
            className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Colaborador
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColaboradores.map((col) => (
              <Link
                key={col.id}
                href={`/colaboradores/${col.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-900 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {col.fotoUrl ? (
                      <img 
                        src={col.fotoUrl} 
                        alt={col.nombre} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <span style={{ display: col.fotoUrl ? 'none' : 'flex' }}>
                      {col.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-700">
                      {col.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{col.cargo}</p>
                    <p className="text-sm text-gray-500 mt-1">CC: {col.cedula}</p>
                    <div className="mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        col.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {col.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredColaboradores.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron colaboradores</p>
          </div>
        )}
      </div>
    </div>
  );
}
