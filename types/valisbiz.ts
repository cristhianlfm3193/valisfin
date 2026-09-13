export type TipoLocal = 'Supermercado' | 'Distribuidora' | 'Tienda' | 'Mini Super' | 'Restaurante';
export type EstadoTarea = 'por_hacer' | 'en_ruta' | 'completado';
export type TipoTarea = 'coaching' | 'trade_marketing' | 'ruta_critica' | 'inventario';

export interface Vendedor {
  id: string;
  nombre: string;
  ruta_asignada: string | null;
  cuota_mensual: number;
  venta_real_acumulada: number;
  gap_ventas: number;
  porcentaje_alcance: number;
  activo?: boolean; // Asegura que se filtren los inactivos (ej. vacaciones)
  created_at: string;
}

export interface Local {
  id: string;
  nombre_local: string;
  tipo: TipoLocal;
  latitud: number;
  longitud: number;
  direccion: string | null;
  foto_url?: string | null;
  vendedor_id?: string | null;
  vendedor?: Vendedor;
  activo: boolean;
  created_at: string;
}

export interface Tarea {
  id: string;
  vendedor_id: string;
  local_id: string;
  titulo_tarea: string;
  descripcion: string | null;
  estado: EstadoTarea;
  fecha_programada: string;
  tipo_tarea: TipoTarea;
  created_at: string;
  // Relaciones anidadas (opcionales al hacer JOINs)
  vendedor?: Vendedor;
  local?: Local;
}

export interface RegistroVenta {
  id: string;
  vendedor_id: string;
  local_id: string | null;
  monto_facturado: number;
  fecha_registro: string;
  mes_periodo: number;
  anio_periodo: number;
  url_fotografia_evidencia: string | null;
  created_at: string;
}

export interface Facturado {
  id: string;
  vendedor_id: string;
  fecha: string;
  monto_facturado: number;
  mes_periodo: number;
  anio_periodo: number;
  notas: string | null;
  created_at: string;
}

export interface VisitaMensual {
  id: string;
  local_id: string;
  vendedor_id: string;
  fecha: string;
  estado_visita: 'con_compra' | 'sin_compra';
  created_at: string;
  local?: Local;
  vendedor?: Vendedor;
}

export interface MetaSupervisor {
  cuota_global: number;
  venta_global_acumulada: number;
  gap_global: number;
  porcentaje_global: number;
}

// Resumen por vendedor para un mes específico
export interface ResumenMensualVendedor {
  vendedor_id: string;
  nombre: string;
  ruta_asignada: string | null;
  cuota_mensual: number;
  mes_periodo: number | null;
  anio_periodo: number | null;
  // FACTURADO (Finanzas) → base oficial para cuota, % alcance y bono de Jennifer
  total_facturado: number;
  porcentaje_facturado: number;
  gap_facturado: number;
  // VENDIDO REPORTADO (Vendedor) → solo informativo, no genera bono
  total_vendido_reportado: number;
}

// Tabla de bonos de Jennifer según el contrato
export const TABLA_BONOS_JENNIFER = [
  { min: 110, max: Infinity, bono: 500, label: '110% o más' },
  { min: 105, max: 109.99, bono: 475, label: '105% – 109.9%' },
  { min: 100, max: 104.99, bono: 425, label: '100% – 104.9%' },
  { min: 95, max: 99.99, bono: 350, label: '95% – 99.9%' },
  { min: 90, max: 94.99, bono: 250, label: '90% – 94.9%' },
  { min: 85, max: 89.99, bono: 150, label: '85% – 89.9%' },
  { min: 0, max: 84.99, bono: 0, label: 'Menos de 85%' },
] as const;

export function calcularBonoJennifer(porcentajeEquipo: number): { bono: number; label: string } {
  for (const tier of TABLA_BONOS_JENNIFER) {
    if (porcentajeEquipo >= tier.min && porcentajeEquipo <= tier.max) {
      return { bono: tier.bono, label: tier.label };
    }
  }
  return { bono: 0, label: 'Menos de 85%' };
}

