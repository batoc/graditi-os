'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { addTool } from '@/lib/firebase/tools';
import { addColaborador } from '@/lib/firebase/colaboradores';
import { addObra } from '@/lib/firebase/obras';
import { crearPrestamoSalida } from '@/lib/firebase/prestamos';
import { ToolFormData, ColaboradorFormData, ObraFormData, PrestamoHerramienta } from '@/types/inventory';
import { useRouter } from 'next/navigation';

const SAMPLE_TOOLS: ToolFormData[] = [
  { nombre: "Taladro Percutor DeWalt", codigo: "TAL-001", categoria: "Eléctrica", estado: "disponible", ubicacion: "Bodega Central", descripcion: "Taladro percutor de 1/2 pulgada", imageUrl: "https://m.media-amazon.com/images/I/61+R+T5+1UL._AC_SL1500_.jpg", fechaCompra: "2023-01-01", valorCompra: 450000, proveedor: "Homecenter" },
  { nombre: "Pulidora Makita 4-1/2", codigo: "PUL-001", categoria: "Eléctrica", estado: "disponible", ubicacion: "Bodega Central", descripcion: "Pulidora angular", imageUrl: "https://m.media-amazon.com/images/I/71R2o5-k+dL._AC_SL1500_.jpg", fechaCompra: "2023-02-15", valorCompra: 320000, proveedor: "Easy" },
  { nombre: "Martillo Demoledor Bosch", codigo: "DEM-001", categoria: "Pesada", estado: "disponible", ubicacion: "Bodega Central", descripcion: "Martillo rompepavimento", imageUrl: "https://m.media-amazon.com/images/I/61N+x+a+1UL._AC_SL1000_.jpg", fechaCompra: "2022-11-20", valorCompra: 1200000, proveedor: "Ferreteria Industrial" },
  { nombre: "Sierra Circular", codigo: "SIE-001", categoria: "Corte", estado: "disponible", ubicacion: "Bodega Central", descripcion: "Sierra circular 7-1/4", imageUrl: "https://m.media-amazon.com/images/I/71X+x+a+1UL._AC_SL1500_.jpg", fechaCompra: "2023-03-10", valorCompra: 550000, proveedor: "Homecenter" },
  { nombre: "Nivel Laser", codigo: "NIV-001", categoria: "Medición", estado: "disponible", ubicacion: "Bodega Central", descripcion: "Nivel laser 3 lineas", imageUrl: "https://m.media-amazon.com/images/I/61Z+x+a+1UL._AC_SL1200_.jpg", fechaCompra: "2023-04-05", valorCompra: 380000, proveedor: "Amazon" },
  { nombre: "Planta Eléctrica", codigo: "GEN-001", categoria: "Generación", estado: "mantenimiento", ubicacion: "Taller", descripcion: "En reparación por falla de encendido", imageUrl: "https://m.media-amazon.com/images/I/71Y+x+a+1UL._AC_SL1500_.jpg", fechaCompra: "2021-06-15", valorCompra: 2500000, proveedor: "Enermax" },
  { nombre: "Taladro Inalámbrico", codigo: "TAL-002", categoria: "Eléctrica", estado: "disponible", ubicacion: "Bodega Central", descripcion: "Taladro 20V Max", imageUrl: "https://m.media-amazon.com/images/I/61+R+T5+1UL._AC_SL1500_.jpg", fechaCompra: "2023-05-20", valorCompra: 650000, proveedor: "Homecenter" },
  { nombre: "Esmeril de Banco", codigo: "ESM-001", categoria: "Taller", estado: "disponible", ubicacion: "Taller", descripcion: "Esmeril de 6 pulgadas", imageUrl: "https://m.media-amazon.com/images/I/71R2o5-k+dL._AC_SL1500_.jpg", fechaCompra: "2023-01-10", valorCompra: 420000, proveedor: "Ferreteria Industrial" },
];

const SAMPLE_COLABORADORES: ColaboradorFormData[] = [
  { nombre: "Juan Perez", cedula: "123456789", cargo: "Oficial", telefono: "3001234567", email: "juan@graditi.com", estado: "activo" },
  { nombre: "Maria Rodriguez", cedula: "987654321", cargo: "Ayudante", telefono: "3109876543", email: "maria@graditi.com", estado: "activo" },
  { nombre: "Carlos Lopez", cedula: "456789123", cargo: "Maestro", telefono: "3204567890", email: "carlos@graditi.com", estado: "activo" },
  { nombre: "Ana Martinez", cedula: "789123456", cargo: "Arquitecta", telefono: "3156789012", email: "ana@graditi.com", estado: "activo" },
];

const SAMPLE_OBRAS: ObraFormData[] = [
  { codigo: "OBR-001", nombre: "Edificio Altos del Parque", ubicacion: "Calle 123 # 45-67", cliente: "Constructora Bolivar", fechaInicio: "2023-01-15", estado: "activa", descripcion: "Proyecto residencial de 20 pisos" },
  { codigo: "OBR-002", nombre: "Centro Comercial Plaza", ubicacion: "Av. Principal # 10-20", cliente: "Inversiones SAS", fechaInicio: "2023-03-20", estado: "activa", descripcion: "Remodelación zona de comidas" },
  { codigo: "OBR-003", nombre: "Casa Campestre La Calera", ubicacion: "Km 5 Via La Calera", cliente: "Juan Valdez", fechaInicio: "2023-06-01", estado: "pausada", descripcion: "Construcción vivienda unifamiliar" },
];

export default function SeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleSeed = async () => {
    if (!confirm('¿Estás seguro de generar datos de prueba? Esto añadirá nuevos registros a tu base de datos actual.')) return;
    
    setLoading(true);
    setLogs([]);
    addLog('Iniciando carga de datos...');

    try {
      // 1. Crear Herramientas
      addLog('Creando herramientas...');
      const toolIds: { id: string, nombre: string, codigo: string }[] = [];
      for (const tool of SAMPLE_TOOLS) {
        const id = await addTool(tool);
        toolIds.push({ id, nombre: tool.nombre, codigo: tool.codigo });
        addLog(`✅ Herramienta creada: ${tool.nombre}`);
      }

      // 2. Crear Colaboradores
      addLog('Creando colaboradores...');
      const colabIds: { id: string, nombre: string }[] = [];
      for (const colab of SAMPLE_COLABORADORES) {
        const id = await addColaborador(colab);
        colabIds.push({ id, nombre: colab.nombre });
        addLog(`✅ Colaborador creado: ${colab.nombre}`);
      }

      // 3. Crear Obras
      addLog('Creando obras...');
      const obraIds: { id: string, nombre: string }[] = [];
      for (const obra of SAMPLE_OBRAS) {
        const id = await addObra(obra);
        obraIds.push({ id, nombre: obra.nombre });
        addLog(`✅ Obra creada: ${obra.nombre}`);
      }

      // 4. Crear Préstamos (Solo si tenemos suficientes datos)
      if (toolIds.length > 2 && colabIds.length > 1 && obraIds.length > 1) {
        addLog('Creando préstamos de ejemplo...');
        
        // Préstamo 1: Juan en Edificio Altos del Parque (2 herramientas)
        const loan1Tools: PrestamoHerramienta[] = [
          { id: toolIds[0].id, nombre: toolIds[0].nombre, codigo: toolIds[0].codigo, estado: 'en_uso', observacionesSalida: 'Nueva' },
          { id: toolIds[3].id, nombre: toolIds[3].nombre, codigo: toolIds[3].codigo, estado: 'en_uso', observacionesSalida: '' }
        ];
        
        await crearPrestamoSalida(
          colabIds[0].id,
          colabIds[0].nombre,
          obraIds[0].id,
          obraIds[0].nombre,
          loan1Tools,
          "Admin",
          "Préstamo inicial para inicio de obra"
        );
        addLog(`✅ Préstamo creado para ${colabIds[0].nombre}`);

        // Préstamo 2: Maria en CC Plaza (1 herramienta)
        const loan2Tools: PrestamoHerramienta[] = [
          { id: toolIds[1].id, nombre: toolIds[1].nombre, codigo: toolIds[1].codigo, estado: 'en_uso', observacionesSalida: '' }
        ];
        
        await crearPrestamoSalida(
          colabIds[1].id,
          colabIds[1].nombre,
          obraIds[1].id,
          obraIds[1].nombre,
          loan2Tools,
          "Admin",
          "Entrega de equipo personal"
        );
        addLog(`✅ Préstamo creado para ${colabIds[1].nombre}`);
      }

      addLog('🚀 Proceso finalizado correctamente!');
      
    } catch (error) {
      console.error(error);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Generador de Datos de Prueba</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 mb-8">
            Esta herramienta permite poblar la base de datos con información de ejemplo para visualizar
            el funcionamiento del sistema. Se crearán:
            <br />• {SAMPLE_TOOLS.length} Herramientas
            <br />• {SAMPLE_COLABORADORES.length} Colaboradores
            <br />• {SAMPLE_OBRAS.length} Obras
            <br />• Préstamos activos vinculando estos elementos
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleSeed}
              disabled={loading}
              className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 disabled:bg-gray-400 font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                'Generar Datos'
              )}
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              Volver al Inicio
            </button>
          </div>

          {logs.length > 0 && (
            <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
