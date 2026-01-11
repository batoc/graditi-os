'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Obra, Tool, Colaborador, Prestamo, MovimientoMaterial } from '@/types/inventory';
import { getTools } from '@/lib/firebase/tools';
import { getPrestamos } from '@/lib/firebase/prestamos';
import { getMaterialesPorObra } from '@/lib/firebase/queries';
// We need to import Leaflet to fix the icon issue in Next.js
import L from 'leaflet';

// Fix for default markers in Leaflet with Next.js/Webpack
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface ProjectsMapProps {
    obras: Obra[];
}

interface ObraDetails {
    tools: Tool[];
    colaboradores: Set<string>; // Names of collaborators
    materiales: { nombre: string; cantidad: number; unidad: string }[];
}

interface PopupContentProps {
    obra: Obra;
    details: ObraDetails;
    loading: boolean;
}

function PopupContent({ obra, details, loading }: PopupContentProps) {
    const [showTools, setShowTools] = useState(false);
    const [showColabs, setShowColabs] = useState(false);
    const [showMaterials, setShowMaterials] = useState(false);

    return (
        <div className="p-2">
            <h3 className="font-bold text-lg mb-1">{obra.nombre}</h3>
            <p className="text-gray-600 text-xs mb-2">{obra.ubicacion}</p>
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                <h4 className="font-semibold text-xs uppercase text-gray-500 mb-2">Recursos Asignados</h4>
                {loading ? (
                    <p className="text-xs">Cargando...</p>
                ) : (
                    <>
                        {/* Herramientas */}
                        <div className="border-b border-gray-100 pb-2">
                            <button
                                onClick={() => setShowTools(!showTools)}
                                className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-1 rounded transition"
                            >
                                <span className="text-sm">
                                    🔧 <span className="font-bold text-red-600">{details.tools.length}</span> Herramientas
                                </span>
                                <span className="text-xs text-gray-400">{showTools ? '▼' : '▶'}</span>
                            </button>
                            {showTools && details.tools.length > 0 && (
                                <ul className="text-xs text-gray-600 ml-6 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                                    {details.tools.map(t => (
                                        <li key={t.id}>• {t.nombre}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Colaboradores */}
                        <div className="border-b border-gray-100 pb-2">
                            <button
                                onClick={() => setShowColabs(!showColabs)}
                                className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-1 rounded transition"
                            >
                                <span className="text-sm">
                                    👷 <span className="font-bold text-blue-600">{details.colaboradores.size}</span> Colaboradores
                                </span>
                                <span className="text-xs text-gray-400">{showColabs ? '▼' : '▶'}</span>
                            </button>
                            {showColabs && details.colaboradores.size > 0 && (
                                <ul className="text-xs text-gray-600 ml-6 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                                    {Array.from(details.colaboradores).map((nombre, idx) => (
                                        <li key={idx}>• {nombre}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Materiales */}
                        <div>
                            <button
                                onClick={() => setShowMaterials(!showMaterials)}
                                className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-1 rounded transition"
                            >
                                <span className="text-sm">
                                    📦 <span className="font-bold text-green-600">{details.materiales.length}</span> Materiales
                                </span>
                                <span className="text-xs text-gray-400">{showMaterials ? '▼' : '▶'}</span>
                            </button>
                            {showMaterials && details.materiales.length > 0 && (
                                <ul className="text-xs text-gray-600 ml-6 mt-1 max-h-24 overflow-y-auto space-y-0.5">
                                    {details.materiales.map((mat, idx) => (
                                        <li key={idx}>• {mat.nombre}: <span className="font-semibold">{mat.cantidad} {mat.unidad}</span></li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ProjectsMap({ obras }: ProjectsMapProps) {
    const [activeObras, setActiveObras] = useState<Obra[]>([]);
    const [details, setDetails] = useState<Record<string, ObraDetails>>({});
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        // Filter obras with valid coordinates
        const validObras = obras.filter(o => 
            o.estado === 'activa' && 
            o.latitud && 
            o.longitud && 
            !isNaN(Number(o.latitud)) && 
            !isNaN(Number(o.longitud))
        );
        setActiveObras(validObras);

        if (validObras.length > 0) {
            loadDetails(validObras);
        }
    }, [obras]);

    const loadDetails = async (validObras: Obra[]) => {
        setLoadingDetails(true);
        try {
            // Fetch all tools and prestamos
            const allTools = await getTools();
            const allPrestamos = await getPrestamos();
            
            const newDetails: Record<string, ObraDetails> = {};

            for (const obra of validObras) {
                // Find tools at this Obra (by location)
                const toolsAtObra = allTools.filter(t => 
                    t.ubicacion === obra.nombre || 
                    t.ubicacion === obra.id
                );

                // Find colaboradores via active loans to this obra
                const colaboradoresSet = new Set<string>();
                const prestamosActivos = allPrestamos.filter(p => 
                    p.obraId === obra.id && p.estado === 'activo'
                );
                
                prestamosActivos.forEach(p => {
                    colaboradoresSet.add(p.colaboradorNombre);
                    
                    // Also add tools from prestamos (in case location isn't updated)
                    p.herramientas.forEach(h => {
                        if (!h.devuelto) {
                            // Check if this tool is already in toolsAtObra
                            const toolExists = toolsAtObra.find(t => t.id === h.toolId);
                            if (!toolExists) {
                                // Add a minimal tool representation
                                const toolFromPrestamo = allTools.find(t => t.id === h.toolId);
                                if (toolFromPrestamo) {
                                    toolsAtObra.push(toolFromPrestamo);
                                }
                            }
                        }
                    });
                });

                // Find materials sent to this obra
                const materialesEnObra = await getMaterialesPorObra(obra.id);
                
                newDetails[obra.id] = {
                    tools: toolsAtObra,
                    colaboradores: colaboradoresSet,
                    materiales: materialesEnObra
                };
            }
            
            setDetails(newDetails);
        } catch (e) {
            console.error("Error loading map details", e);
        } finally {
            setLoadingDetails(false);
        }
    }

    if (activeObras.length === 0) {
        return (
            <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                No hay obras activas con coordenadas configuradas.
            </div>
        );
    }

    // Default center (Bogotá or first obra)
    const centerPos: [number, number] = [
        Number(activeObras[0].latitud) || 4.6097, 
        Number(activeObras[0].longitud) || -74.0817
    ];

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0">
             <MapContainer 
                center={centerPos} 
                zoom={11} 
                scrollWheelZoom={false} 
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {activeObras.map((obra) => (
                    <Marker 
                        key={obra.id} 
                        position={[Number(obra.latitud), Number(obra.longitud)]}
                        icon={icon}
                    >
                        <Popup className="min-w-[300px]">
                            <PopupContent 
                                obra={obra}
                                details={details[obra.id] || { tools: [], colaboradores: new Set(), materiales: [] }}
                                loading={loadingDetails}
                            />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
