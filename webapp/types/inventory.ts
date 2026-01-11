export type ToolStatus = 'disponible' | 'en_uso' | 'mantenimiento' | 'baja';

export interface Tool {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  estado: ToolStatus;
  ubicacion: string;
  imagenUrl?: string;
  descripcion?: string;
  nextMaintenanceDate?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface ToolFormData {
  nombre: string;
  codigo: string;
  categoria: string;
  estado: ToolStatus;
  ubicacion: string;
  imagenUrl?: string; // URL externa de la imagen
  descripcion?: string;
  nextMaintenanceDate?: string; // Form input uses string YYYY-MM-DD
}

export interface MaintenanceRecord {
  id?: string;
  toolId: string;
  toolCode: string;
  type: string; // 'preventivo', 'correctivo', 'calibracion', etc.
  description: string;
  cost?: number;
  technician: string;
  date: number;
  nextMaintenanceDate?: number;
  attachments?: string[];
  createdBy: string;
  createdAt: number;
}

export interface Movement {
  id?: string;
  toolId: string;
  toolCode: string;
  type: 'salida' | 'entrada';
  responsible: string; // Operario ID or Name
  destination: string; // Obra ID or Name
  timestamp: number;
  userId: string; // Who authorized/scanned
}

// ==================== COLABORADORES ====================

export interface Colaborador {
  id: string;
  nombre: string;
  cedula: string;
  cargo: string;
  telefono?: string;
  email?: string;
  estado: 'activo' | 'inactivo';
  fotoUrl?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface ColaboradorFormData {
  nombre: string;
  cedula: string;
  cargo: string;
  telefono?: string;
  email?: string;
  estado: 'activo' | 'inactivo';
  fotoUrl?: string;
}

// ==================== OBRAS ====================

export interface Obra {
  id: string;
  nombre: string;
  codigo: string;
  cliente?: string;
  ubicacion: string;
  estado: 'activa' | 'pausada' | 'finalizada';
  fechaInicio: number;
  fechaFin?: number;
  descripcion?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface ObraFormData {
  nombre: string;
  codigo: string;
  cliente?: string;
  ubicacion: string;
  estado: 'activa' | 'pausada' | 'finalizada';
  fechaInicio: string;
  fechaFin?: string;
  descripcion?: string;
}

// ==================== PRÉSTAMOS (TRAZABILIDAD) ====================

export interface Prestamo {
  id: string;
  tipo: 'salida' | 'entrada';
  colaboradorId: string;
  colaboradorNombre: string;
  obraId: string;
  obraNombre: string;
  herramientas: PrestamoHerramienta[];
  estado: 'activo' | 'devuelto' | 'parcial'; // parcial = algunas devueltas, otras no
  fechaSalida: number;
  fechaDevolucion?: number;
  observaciones?: string;
  recibidoPor: string; // Quien registra (secretaria/seguridad)
  createdAt: number;
  updatedAt?: number;
}

export interface PrestamoHerramienta {
  toolId: string;
  toolCode: string;
  toolNombre: string;
  devuelto: boolean;
  fechaDevolucion?: number;
  estadoDevolucion?: 'bueno' | 'regular' | 'malo';
  observacionesDevolucion?: string;
}

// ==================== MATERIALES ====================

export interface Material {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string; // e.g., 'Consumible', 'Ferreteria', 'Electrico'
  unidad: string; // e.g., 'kg', 'm', 'unidad', 'bulto', 'caja'
  cantidadDisponible: number;
  cantidadMinima: number; // Para alertas de stock bajo
  ubicacion?: string; // Bodega
  descripcion?: string;
  precioUnitario?: number; // Opcional, para costos
  createdAt: number;
  updatedAt?: number;
}

export interface MaterialFormData {
  nombre: string;
  codigo: string;
  categoria: string;
  unidad: string;
  cantidadMinima: string; // Form input string
  ubicacion?: string;
  descripcion?: string;
  precioUnitario?: string;
  cantidadInicial?: string; // Only for creation
}

export interface MovimientoMaterial {
  id?: string;
  materialId: string;
  materialNombre: string;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  
  // Contexto de salida
  obraId?: string;
  obraNombre?: string;
  colaboradorId?: string; // Quien retira
  colaboradorNombre?: string;
  
  // Contexto de entrada
  proveedor?: string;
  factura?: string;
  costoTotal?: number;
  
  fecha: number;
  usuarioId: string; // Quien registra en el sistema
  observaciones?: string;
}
