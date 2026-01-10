import Navbar from '@/components/layout/Navbar';
import QRScanner from '@/components/inventario/QRScanner';

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Escáner QR</h1>
          <p className="text-gray-500 mt-2">
            Escanea el código QR de una herramienta para registrar movimientos
          </p>
        </div>

        <QRScanner />
      </div>
    </div>
  );
}
