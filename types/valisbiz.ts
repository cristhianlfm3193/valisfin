export type CadenaLocal = 'Rey' | 'Riba Smith' | 'Super 99' | 'Mr. Precio' | 'Otro';
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
  created_at: string;
}

export interface Local {
  id: string;
  nombre_local: string;
  cadena: CadenaLocal;
  latitud: number;
  longitud: number;
  direccion: string | null;
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
  local_id: string;
  monto_facturado: number;
  fecha_registro: string;
  url_fotografia_evidencia: string | null;
  created_at: string;
}

export interface MetaSupervisor {
  cuota_global: number;
  venta_global_acumulada: number;
  gap_global: number;
  porcentaje_global: number;
}
