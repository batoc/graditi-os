import Navbar from '@/components/layout/Navbar';
import ToolForm from '@/components/inventario/ToolForm';

export default function NuevaHerramientaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nueva Herramienta</h1>
          <p className="text-gray-500 mt-1">Registra una nueva herramienta en el inventario</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <ToolForm />
        </div>
      </div>
    </div>
  );
}
