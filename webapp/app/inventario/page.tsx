'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTools } from '@/lib/firebase/tools';
import { Tool } from '@/types/inventory';
import ToolCard from '@/components/inventario/ToolCard';
import Navbar from '@/components/layout/Navbar';

export default function InventarioPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [searchTerm, categoryFilter, statusFilter, tools]);

  const loadTools = async () => {
    try {
      const data = await getTools();
      setTools(data);
      setFilteredTools(data);
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = tools;

    if (searchTerm) {
      filtered = filtered.filter(
        (tool) =>
          tool.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((tool) => tool.categoria === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((tool) => tool.estado === statusFilter);
    }

    setFilteredTools(filtered);
  };

  const categories = Array.from(new Set(tools.map((t) => t.categoria)));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-500 mt-1">
              {filteredTools.length} de {tools.length} herramientas
            </p>
          </div>
          <Link
            href="/inventario/nuevo"
            className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 font-medium shadow-sm shadow-red-200 flex items-center gap-2 justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Herramienta
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 placeholder:text-gray-400 text-gray-900 bg-white font-medium"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 bg-white font-medium appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-900">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize text-gray-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 bg-white font-medium appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-900">Todos los estados</option>
                <option value="disponible" className="text-gray-900">Disponible</option>
                <option value="en_uso" className="text-gray-900">En Uso</option>
                <option value="mantenimiento" className="text-gray-900">Mantenimiento</option>
                <option value="baja" className="text-gray-900">Baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron herramientas</h3>
            <p className="text-gray-500 mb-6">Intenta ajustar los filtros o agregar una nueva herramienta.</p>
            <Link
              href="/inventario/nuevo"
              className="inline-flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Herramienta
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
