'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getToolByCode } from '@/lib/firebase/tools';
import { PrestamoHerramienta } from '@/types/inventory';

interface MultiScannerProps {
  onHerramientasChange: (herramientas: PrestamoHerramienta[]) => void;
  herramientas: PrestamoHerramienta[];
}

export default function MultiScanner({ onHerramientasChange, herramientas }: MultiScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let unmounted = false;

    if (scanning) {
      const startScanner = async () => {
        try {
            // Slight delay to ensure DOM element exists
            await new Promise(r => setTimeout(r, 100));
            if (unmounted) return;

            // Check if element exists before creating instance
            if (!document.getElementById('multi-reader')) {
                console.error("Reader element not found");
                return;
            }

            const scanner = new Html5Qrcode("multi-reader");
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
                    // ignore
                }
            );
        } catch (err) {
            console.error("Error starting scanner", err);
            setScanning(false);
        }
      };
      startScanner();
    } else {
        // Stop logic
        if (scannerRef.current) {
             scannerRef.current.stop().then(() => {
                 scannerRef.current?.clear();
                 scannerRef.current = null;
             }).catch(err => {
                 console.error("Failed to stop scanner", err);
                 scannerRef.current = null;
             });
        }
    }

    return () => {
        unmounted = true;
        if (scannerRef.current) {
            if (scannerRef.current.isScanning) {
                 scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                    scannerRef.current = null;
                }).catch(console.error);
            } else {
                 scannerRef.current.clear();
                 scannerRef.current = null;
            }
        }
    };
  }, [scanning]);


  const agregarHerramienta = async (codigo: string) => {
    // Debounce/Prevent duplicate scans during loading?
    // But loading is global.
    // Let's just proceed.

    // If scanning, we might want to pause? No, continuous scanning is fine.
    // But we should prevent adding the same code if it's currently processing.
    
    // Check if already in list
    if (herramientas.some(h => h.toolCode === codigo)) {
      // alert('Esta herramienta ya está en la lista'); // annoying on continuous scan
      return; 
    }

    setLoading(true);
    try {
      const tool = await getToolByCode(codigo);
      if (!tool) {
        alert('Herramienta no encontrada: ' + codigo);
        return;
      }

      // Re-check existence in case it was added while fetching
      if (herramientas.some(h => h.toolCode === tool.codigo)) {
           return;
      }

      const nueva: PrestamoHerramienta = {
        toolId: tool.id,
        toolCode: tool.codigo,
        toolNombre: tool.nombre,
        devuelto: false
      };

      onHerramientasChange([...herramientas, nueva]);
      
      // Beep
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnYpBSl+zPLaizsIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSd8y/HajDwJFmm/7eSaSwwQWLDo7q1aFgo9mN3yyHUpBSuBzvLajDoIGme+7OOcTg0QV67n8LFeFwo7ldz0yXoqBCl9zPLbjTsJFmrA7eSbSw0RWbDp765aFAo8mN7zx3YqBCqAzvPajToIG2nA7OSaTAwPVq3n8LJfGAk7ldvzyn0sBSh9zPPcjjsJFWq/7uScTQ0RWa/p76xZFQo8l93zx3YpBSp/zvLbjDoIGmq/7OWaTg0PVa3n77FfGgg7ltz0yX0tBSh9y/PcjDwJF2u/7uOcTQ0QWLDp7qxZFgo7mN3zxnUpBCqAz/LaizsIG2u+7OWbTw0PVK3o77JgGQc6lNrzyH4uBSh7yvPajDwJGG3A7uWbTgwRV7Dp7axYFgk7lt3zxXQpBCp/zvHajDoIG2u/7eWbTQwPU63o7rJfGAc5lNvzx34tBCd8yfLajDsJGG3A7uWaTgwQV7Hp765YFgk6lt3zxHMpBCp+zvHaijoHHWu+7eWaTwwPU6zo7bFfFwc4k9ryyH4sBCd8yfHajDsIF2u/7uSaTQwQVrDo765XFQk6ldz0w3IoBSp+zvHaijoHHmy+7uSaTwwPUqzo7LFeFwg4k9rxxn4tBCd7yfDaizoHF2u97uSZTQwQVa/n76tWFAk6ldz0wnIoBSp9zvDZiToIHmy97uOZTQsPUavl67BdFgc3ktrxw3wsBCd7yfDZizkGF2q97uOYTAwPVK7m7qpVFAk5lNvzwXEoBCp8zu/YiDkIF2y77uOYSwsPUqzl66xdFgc2ktjxwnwrBCd7yO/YiDgGFmq87uKYSwsPU6vl6qpYEwk4lNrzwG8nBCl8zu7XhzgGF2q77uGWSwsPUarg6apZEgc2kNbwwH0rBCd5yO3WhzcGFWm77uCUSwwNU6vj56lYEgc1j9XvwH0qAyd5xu3WhjYGFGi57N+TSwsNU6vh6KlXEQc0j9TvwX0pBCZ4xu3VhjUGE2i56t+SSwsNU6zg6KdXEQczjtPvwHwpBCZ3xu3UhTQGE2e46t6RSwsOU6zg56ZXEAcyj9Puv3woAyV1xOvThDMGEma35t2QSgoOVKzh56VYDwYxi9LtvXsnAyVzxOrSgzEGEWW25duPSQkOVKzg56NYDgYxi9Huvnsm');
        audio.play().catch(() => {});
      } catch (e) {}

    } catch (error) {
      console.error('Error:', error);
      alert('Error al buscar la herramienta');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (decodedText: string) => {
      // Add logic to debounce scans if needed
      agregarHerramienta(decodedText);
  };

  const removerHerramienta = (codigo: string) => {
    onHerramientasChange(herramientas.filter(h => h.toolCode !== codigo));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Escanear o Ingresar Herramientas</h3>
        
        {/* Scanner Toggle */}
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setScanning(!scanning)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              scanning 
                ? 'bg-red-700 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {scanning ? '❌ Cerrar Escáner' : '📷 Abrir Escáner QR'}
          </button>
        </div>

        {/* QR Scanner */}
        {scanning && (
          <div className="mb-4 border-2 border-red-700 rounded-lg overflow-hidden bg-black relative">
            <div id="multi-reader" className="w-full" style={{ minHeight: '300px' }}></div>
            <p className="text-center text-white py-2 absolute bottom-0 w-full bg-black/50 z-10">Enfoca el código QR</p>
          </div>
        )}

        {/* Manual Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (manualCode.trim()) {
                  agregarHerramienta(manualCode.trim()).then(() => setManualCode(''));
                }
              }
            }}
            placeholder="O ingresa el código manualmente..."
            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => {
              if (manualCode.trim()) {
                agregarHerramienta(manualCode.trim()).then(() => setManualCode(''));
              }
            }}
            disabled={loading || !manualCode.trim()}
            className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium disabled:opacity-50"
          >
            {loading ? '...' : 'Agregar'}
          </button>
        </div>
      </div>

      {/* Lista de Herramientas Escaneadas */}
      {herramientas.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">
              Herramientas Seleccionadas ({herramientas.length})
            </h3>
            <button
              type="button"
              onClick={() => onHerramientasChange([])}
              className="text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Limpiar Todo
            </button>
          </div>
          
          <div className="space-y-2">
            {herramientas.map((herr) => (
              <div 
                key={herr.toolCode}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{herr.toolNombre}</p>
                  <p className="text-sm text-gray-500">Código: {herr.toolCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removerHerramienta(herr.toolCode)}
                  className="text-red-700 hover:text-red-800 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
