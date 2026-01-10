'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getToolByCode, addMovement } from '@/lib/firebase/tools';
import { Tool, Movement } from '@/types/inventory';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Form states
  const [movementType, setMovementType] = useState<'salida' | 'entrada'>('salida');
  const [responsible, setResponsible] = useState('');
  const [destination, setDestination] = useState('');

  // Start Scanner
  useEffect(() => {
    // Only attempt to start if scanning=true and we don't have a running scanner
    if (scanning && !scannerRef.current) {
      const startScanner = async () => {
        try {
          // Use a small timeout to ensure the "reader" div is mounted
          await new Promise(r => setTimeout(r, 100));

          const scanner = new Html5Qrcode("reader");
          scannerRef.current = scanner;
          
          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              handleScan(decodedText);
            },
            (errorMessage) => {
              // Ignore standard frame errors
            }
          );
        } catch (err) {
          console.error("Error starting scanner:", err);
          setError("No se pudo iniciar la cámara. Verifica los permisos o intenta desde otro dispositivo.");
          setScanning(false);
        }
      };

      startScanner();
    }

    // Cleanup: stop scanner if scanning becomes false
    if (!scanning && scannerRef.current) {
        scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
        }).catch(err => {
            console.error("Error stopping scanner", err);
            scannerRef.current = null;
        });
    }

    return () => {
        // Unmount cleanup
        if (scannerRef.current) {
             scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
                scannerRef.current = null;
            }).catch(console.error);
        }
    };
  }, [scanning]);

  const handleScan = async (code: string) => {
    if (code && !tool) {
      // Stop scanner immediately on success
      if (scannerRef.current) {
          await scannerRef.current.stop();
          scannerRef.current.clear();
          scannerRef.current = null;
      }
      
      setResultCode(code);
      setScanning(false);
      fetchTool(code);
    }
  };

  const fetchTool = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const foundTool = await getToolByCode(code);
      if (foundTool) {
        setTool(foundTool);
        setMovementType(foundTool.estado === 'disponible' ? 'salida' : 'entrada');
      } else {
        setError('Herramienta no encontrada con el código: ' + code);
      }
    } catch (err) {
      console.error(err);
      setError('Error al buscar la herramienta');
    } finally {
      setLoading(false);
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool || !resultCode) return;

    setLoading(true);
    try {
      const movement: Movement = {
        toolId: tool.id,
        toolCode: tool.codigo,
        type: movementType,
        responsible: movementType === 'salida' ? responsible : 'Bodega',
        destination: movementType === 'salida' ? destination : 'Bodega',
        timestamp: Date.now(),
        userId: 'admin'
      };

      await addMovement(movement);
      alert('Movimiento registrado con éxito');
      resetScanner();
    } catch (err) {
      console.error(err);
      alert('Error al registrar movimiento');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(false);
    setResultCode(null);
    setTool(null);
    setError(null);
    setResponsible('');
    setDestination('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="p-4 bg-gradient-to-r from-red-800 to-red-900 text-white flex justify-between items-center">
        <h2 className="font-semibold text-lg">Escáner de Inventario</h2>
        {tool && (
          <button onClick={resetScanner} className="text-sm text-red-100 hover:text-white underline">
            Nueva Búsqueda
          </button>
        )}
      </div>

      {!tool && !scanning && !error && (
        <div className="p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-700 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75z" />
            </svg>
          </div>
          <p className="text-gray-600 text-center mb-6">Escanea el código QR de una herramienta para registrar entrada o salida.</p>
          <button
            onClick={() => setScanning(true)}
            className="w-full py-3 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 transition shadow-sm"
          >
            Activar Cámara
          </button>
        </div>
      )}

      {scanning && (
        <div className="relative bg-black">
          {/* HTML5-QRCode Target Div - ID MUST MATCH "reader" above */}
          <div id="reader" className="w-full" style={{ minHeight: '300px' }}></div>
          
          <button 
            onClick={() => setScanning(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-center text-white py-2 text-sm bg-black/50 absolute bottom-0 w-full z-10">
            Enfoca el código QR
          </p>
        </div>
      )}

      {error && !scanning && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium mb-2">{error}</p>
          <button onClick={resetScanner} className="text-blue-600 underline">Intentar de nuevo</button>
        </div>
      )}

      {loading && !scanning && (
        <div className="p-10 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {tool && !loading && (
        <div className="bg-gray-50">
          <div className="p-6 bg-white border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 relative">
                {tool.imagenUrl ? (
                   <img src={tool.imagenUrl} alt={tool.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">Sin Foto</div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{tool.nombre}</h3>
                <p className="text-sm text-gray-500 font-mono mb-1">{tool.codigo}</p>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium uppercase ${
                  tool.estado === 'disponible' ? 'bg-green-100 text-green-800 border-green-200' :
                  tool.estado === 'en_uso' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {tool.estado.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleMovementSubmit} className="p-6 space-y-4">
            <div className="flex bg-gray-200 p-1 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setMovementType('salida')}
                className={`flex-1 py-1 px-3 rounded text-sm font-medium transition ${
                  movementType === 'salida' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Registrar Salida
              </button>
              <button
                type="button"
                onClick={() => setMovementType('entrada')}
                className={`flex-1 py-1 px-3 rounded text-sm font-medium transition ${
                  movementType === 'entrada' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Registrar Entrada
              </button>
            </div>

            {movementType === 'salida' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    required
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="Nombre del operario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Obra / Destino</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    placeholder="Lugar de trabajo"
                  />
                </div>
              </>
            )}

            {movementType === 'entrada' && (
              <div className="p-4 bg-green-50 text-green-800 rounded-lg text-sm border border-green-200">
                La herramienta será marcada como "Disponible" y regresada a bodega.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-700 text-white rounded-lg font-bold hover:bg-red-800 transition shadow-sm disabled:bg-gray-400 mt-4"
            >
              {loading ? 'Registrando...' : 'Confirmar Movimiento'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
