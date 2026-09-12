'use server';

import { createClient } from "@/lib/supabase/server";

export interface RegistroReporteDia {
  vendedor_nombre: string;
  vistas: number;
  con_compra: number;
  sin_compra: number;
  contado: number;
  credito: number;
  total: number;
}

export interface DatosReporteDia {
  fecha: string; // YYYY-MM-DD
  supervisor: string;
  agencia: string;
  observacion: string;
  registros: RegistroReporteDia[];
}

export async function getDatosReporteDia(fecha: string): Promise<DatosReporteDia> {
  const supabase = await createClient();

  // Obtener todos los vendedores
  const { data: vendedores } = await supabase
    .from('vendedores')
    .select('id, nombre, activo')
    .order('nombre', { ascending: true });

  // Registros de ventas para esa fecha (fecha_registro empieza con la fecha YYYY-MM-DD)
  const { data: registros } = await supabase
    .from('registros_ventas')
    .select('vendedor_id, vistas, con_compra, sin_compra, contado, credito, monto_facturado, vendedor:vendedores(nombre)')
    .gte('fecha_registro', `${fecha}T00:00:00`)
    .lt('fecha_registro', `${fecha}T23:59:59`);

  // Construir mapa: vendedor_id -> datos acumulados del día
  const mapaVendedor: Record<string, RegistroReporteDia> = {};

  for (const vendedor of (vendedores || [])) {
    // Si el vendedor está explícitamente inactivo (ej. vacaciones), no lo incluimos en el reporte
    if (vendedor.activo === false) continue;
    
    mapaVendedor[vendedor.id] = {
      vendedor_nombre: vendedor.nombre,
      vistas: 0,
      con_compra: 0,
      sin_compra: 0,
      contado: 0,
      credito: 0,
      total: 0,
    };
  }

  for (const r of (registros || [])) {
    if (mapaVendedor[r.vendedor_id]) {
      mapaVendedor[r.vendedor_id].vistas += r.vistas ?? 0;
      mapaVendedor[r.vendedor_id].con_compra += r.con_compra ?? 0;
      mapaVendedor[r.vendedor_id].sin_compra += r.sin_compra ?? 0;
      mapaVendedor[r.vendedor_id].contado += Number(r.contado ?? 0);
      mapaVendedor[r.vendedor_id].credito += Number(r.credito ?? 0);
      mapaVendedor[r.vendedor_id].total += Number(r.monto_facturado ?? 0);
    }
  }

  return {
    fecha,
    supervisor: 'Jennifer Camaño',
    agencia: 'Panamá Oeste',
    observacion: 'Ruta Chorrera, Arraijan',
    registros: Object.values(mapaVendedor),
  };
}
