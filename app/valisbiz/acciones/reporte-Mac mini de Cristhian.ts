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

export interface RegistroEficienciaRuta {
  vendedor_id: string;
  vendedor_nombre: string;
  sitios_asignados: number;
  visitas: number;
  con_compra: number;
  sin_compra: number;
  porcentaje_recorrido: number;
  porcentaje_efectividad: number;
}

export interface DatosReporteEficiencia {
  fecha_desde: string;
  fecha_hasta: string;
  supervisor: string;
  agencia: string;
  observacion: string;
  registros: RegistroEficienciaRuta[];
}

export async function getDatosReporteEficiencia(fechaDesde: string, fechaHasta: string): Promise<DatosReporteEficiencia> {
  const supabase = await createClient();

  // 1. Obtener vendedores activos
  const { data: vendedores } = await supabase
    .from('vendedores')
    .select('id, nombre, activo')
    .order('nombre', { ascending: true });

  // 2. Obtener locales para contar los asignados
  const { data: locales } = await supabase
    .from('locales')
    .select('id, vendedor_id')
    .eq('activo', true);

  // 3. Obtener visitas en el rango
  const { data: visitas } = await supabase
    .from('visitas_mensuales')
    .select('local_id, vendedor_id, estado_visita')
    .gte('fecha', `${fechaDesde}`)
    .lte('fecha', `${fechaHasta}`);

  const mapaVendedor: Record<string, RegistroEficienciaRuta> = {};

  for (const vendedor of (vendedores || [])) {
    if (vendedor.activo === false) continue;
    
    // Contar locales asignados
    const sitiosAsignados = (locales || []).filter(l => l.vendedor_id === vendedor.id).length;

    mapaVendedor[vendedor.id] = {
      vendedor_id: vendedor.id,
      vendedor_nombre: vendedor.nombre,
      sitios_asignados: sitiosAsignados,
      visitas: 0,
      con_compra: 0,
      sin_compra: 0,
      porcentaje_recorrido: 0,
      porcentaje_efectividad: 0,
    };
  }

  // Contabilizar visitas (usamos visitas absolutas porque las "visitas hechas", "con compra" y "sin compra" son por cada transacción).
  // Para el % de recorrido, usaremos locales únicos visitados.
  const localesVisitadosPorVendedor: Record<string, Set<string>> = {};

  for (const visita of (visitas || [])) {
    const vId = visita.vendedor_id;
    if (mapaVendedor[vId]) {
      mapaVendedor[vId].visitas++;
      if (visita.estado_visita === 'con_compra') {
        mapaVendedor[vId].con_compra++;
      } else if (visita.estado_visita === 'sin_compra') {
        mapaVendedor[vId].sin_compra++;
      }
      
      if (!localesVisitadosPorVendedor[vId]) localesVisitadosPorVendedor[vId] = new Set();
      localesVisitadosPorVendedor[vId].add(visita.local_id);
    }
  }

  // Calcular porcentajes
  for (const vId in mapaVendedor) {
    const record = mapaVendedor[vId];
    const unicosVisitados = localesVisitadosPorVendedor[vId]?.size || 0;
    
    if (record.sitios_asignados > 0) {
      record.porcentaje_recorrido = (unicosVisitados / record.sitios_asignados) * 100;
    }
    
    if (record.visitas > 0) {
      record.porcentaje_efectividad = (record.con_compra / record.visitas) * 100;
    }
  }

  return {
    fecha_desde: fechaDesde,
    fecha_hasta: fechaHasta,
    supervisor: 'Jennifer Camaño',
    agencia: 'Panamá Oeste',
    observacion: 'Reporte de Eficiencia de Ruta',
    registros: Object.values(mapaVendedor),
  };
}
