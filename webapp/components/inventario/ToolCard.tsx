'use client';

import Link from 'next/link';
import { Tool } from '@/types/inventory';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const statusConfig = {
    disponible: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disponible' },
    en_uso: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Uso' },
    mantenimiento: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Mantenimiento' },
    baja: { bg: 'bg-red-100', text: 'text-red-800', label: 'Baja' },
  };

  const status = statusConfig[tool.estado] || { bg: 'bg-gray-100', text: 'text-gray-800', label: tool.estado || 'Desconocido' };

  return (
    <Link
      href={`/inventario/${tool.id}`}
      className="bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {tool.imagenUrl ? (
          <img
            src={tool.imagenUrl}
            alt={tool.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <ToolIcon />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-red-700 transition">
          {tool.nombre}
        </h3>
        <p className="text-sm text-gray-500 font-mono mb-2">{tool.codigo}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CategoryIcon />
            <span className="capitalize">{tool.categoria}</span>
          </div>
          <div className="flex items-center gap-1">
            <LocationIcon />
            <span>{tool.ubicacion}</span>
          </div>
        </div>

        {tool.nextMaintenanceDate && tool.nextMaintenanceDate <= Date.now() + 7 * 24 * 60 * 60 * 1000 && (
          <div className="mt-3 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
            <WarningIcon />
            <span>Mantenimiento próximo</span>
          </div>
        )}
      </div>
    </Link>
  );
}

const ToolIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CategoryIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
