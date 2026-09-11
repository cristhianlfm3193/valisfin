'use server';

import { createClient } from "@/lib/supabase/server";
import type { MetaSupervisor, Vendedor, Local, Tarea, ResumenMensualVendedor } from "@/types/valisbiz";

export async function getDashboardData(mes?: number, anio?: number) {
  const supabase = await createClient();
  const now = new Date();
  const targetMes = mes ?? (now.getMonth() + 1);
  const targetAnio = anio ?? now.getFullYear();

  // ── Todas las queries en paralelo ──────────────────────────────────────────
  const [
    { data: vendedores },
    { data: locales },
    { data: tareas },
    { data: facturado },
    { data: registrosVentas },
    { data: visitas },
  ] = await Promise.all([
    supabase
      .from('vendedores')
      .select('*')
      .order('nombre', { ascending: true }),

    supabase
      .from('locales')
      .select('*')
      .order('nombre_local', { ascending: true }),

    supabase
      .from('tareas')
      .select(`*, vendedor:vendedores(nombre), local:locales(nombre_local, cadena)`)
      .order('fecha_programada', { ascending: true }),

    supabase
      .from('facturado')
      .select('*, vendedor:vendedores(nombre)')
      .eq('mes_periodo', targetMes)
      .eq('anio_periodo', targetAnio)
      .order('fecha', { ascending: false }),

    supabase
      .from('registros_ventas')
      .select('*, vendedor:vendedores(nombre)')
      .eq('mes_periodo', targetMes)
      .eq('anio_periodo', targetAnio)
      .order('fecha_registro', { ascending: false }),

    supabase
      .from('visitas_mensuales')
      .select('*, vendedor:vendedores(nombre), local:locales(nombre_local, cadena)')
      .gte('fecha', `${targetAnio}-${String(targetMes).padStart(2, '0')}-01`)
      .lt('fecha', targetMes === 12 
          ? `${targetAnio + 1}-01-01` 
          : `${targetAnio}-${String(targetMes + 1).padStart(2, '0')}-01`)
  ]);


  // Construir resumen mensual por vendedor
  // % de cuota y GAP se calculan con FACTURADO, no con vendido reportado
  const resumenMensual: ResumenMensualVendedor[] = (vendedores || []).map(v => {
    const cuota = Number(v.cuota_mensual);

    // Facturado (Finanzas) — determina bono y logro oficial
    const facturadoVendedor = (facturado || []).filter(f => f.vendedor_id === v.id);
    const totalFacturado = facturadoVendedor.reduce((acc, f) => acc + Number(f.monto_facturado), 0);
    const porcentajeFacturado = cuota > 0 ? (totalFacturado / cuota) * 100 : 0;
    const gapFacturado = cuota - totalFacturado;

    // Vendido reportado (Vendedor) — solo informativo
    const ventasVendedor = (registrosVentas || []).filter(r => r.vendedor_id === v.id);
    const totalVendidoReportado = ventasVendedor.reduce((acc, r) => acc + Number(r.monto_facturado), 0);

    return {
      vendedor_id: v.id,
      nombre: v.nombre,
      ruta_asignada: v.ruta_asignada,
      cuota_mensual: cuota,
      mes_periodo: targetMes,
      anio_periodo: targetAnio,
      total_facturado: totalFacturado,
      porcentaje_facturado: porcentajeFacturado,
      gap_facturado: gapFacturado,
      total_vendido_reportado: totalVendidoReportado,
    };
  });

  // Metas globales de Jennifer — basadas en FACTURADO
  const cuotaGlobal = resumenMensual.reduce((acc, r) => acc + r.cuota_mensual, 0);
  const facturadoGlobal = resumenMensual.reduce((acc, r) => acc + r.total_facturado, 0);
  const metas: MetaSupervisor = {
    cuota_global: cuotaGlobal || 85000,
    venta_global_acumulada: facturadoGlobal, // representa el facturado global del mes
    gap_global: (cuotaGlobal || 85000) - facturadoGlobal,
    porcentaje_global: cuotaGlobal > 0 ? (facturadoGlobal / cuotaGlobal) * 100 : 0,
  };

  return {
    metas,
    vendedores: (vendedores as Vendedor[]) || [],
    resumenMensual,
    locales: (locales as Local[]) || [],
    tareas: (tareas as any[]) || [],
    mesPeriodo: targetMes,
    anioPeriodo: targetAnio,
    // Registros detallados para las tablas de historial
    registrosFacturado: (facturado || []).map((f: any) => ({
      id: f.id,
      vendedor_nombre: f.vendedor?.nombre || 'Desconocido',
      fecha: f.fecha,
      monto: Number(f.monto_facturado),
      contado: Number(f.contado ?? 0),
      credito: Number(f.credito ?? 0),
      notas: f.notas,
    })),
    registrosVendido: (registrosVentas || []).map((r: any) => ({
      id: r.id,
      vendedor_nombre: r.vendedor?.nombre || 'Desconocido',
      fecha: r.fecha_registro ? r.fecha_registro.replace(' ', 'T').split('T')[0] : '',
      monto: Number(r.monto_facturado),
      vistas: r.vistas ?? 0,
      con_compra: r.con_compra ?? 0,
      sin_compra: r.sin_compra ?? 0,
      contado: Number(r.contado ?? 0),
      credito: Number(r.credito ?? 0),
    })),
    visitas: (visitas as any[]) || [],
  };
}

export async function updateTareaEstado(tareaId: string, nuevoEstado: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tareas')
    .update({ estado: nuevoEstado })
    .eq('id', tareaId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Registrar venta diaria del vendedor (solo informativo)
export async function registrarVenta(
  vendedorId: string,
  montoVendido: number,
  localId?: string,
  fecha?: Date,
  extras?: {
    vistas?: number;
    con_compra?: number;
    sin_compra?: number;
    contado?: number;
    credito?: number;
  }
) {
  const supabase = await createClient();
  const fechaRegistro = fecha ?? new Date();
  const { error } = await supabase.from('registros_ventas').insert({
    vendedor_id: vendedorId,
    local_id: localId || null,
    monto_facturado: montoVendido, // Total del día = contado + crédito
    fecha_registro: fechaRegistro.toISOString(),
    mes_periodo: fechaRegistro.getMonth() + 1,
    anio_periodo: fechaRegistro.getFullYear(),
    vistas: extras?.vistas ?? 0,
    con_compra: extras?.con_compra ?? 0,
    sin_compra: extras?.sin_compra ?? 0,
    contado: extras?.contado ?? 0,
    credito: extras?.credito ?? 0,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}


// Registrar facturación oficial de Finanzas (base para bono y cuota)
export async function registrarFacturado(
  vendedorId: string,
  contado: number,
  credito: number,
  fecha: Date,
  notas?: string
) {
  const supabase = await createClient();
  const monto_facturado = contado + credito;
  const { error } = await supabase.from('facturado').insert({
    vendedor_id: vendedorId,
    monto_facturado,
    contado,
    credito,
    fecha: fecha.toISOString().split('T')[0],
    mes_periodo: fecha.getMonth() + 1,
    anio_periodo: fecha.getFullYear(),
    notas: notas || null,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Editar registro de facturado ───────────────────────────────────────────────────────
export async function editarFacturado(
  id: string,
  contado: number,
  credito: number,
  fecha: string,
  notas?: string
) {
  const supabase = await createClient();
  const fechaDate = new Date(fecha + 'T12:00:00');
  const monto_facturado = contado + credito;
  const { error } = await supabase
    .from('facturado')
    .update({
      monto_facturado,
      contado,
      credito,
      fecha: fecha,
      mes_periodo: fechaDate.getMonth() + 1,
      anio_periodo: fechaDate.getFullYear(),
      notas: notas || null,
    })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Borrar registro de facturado ───────────────────────────────────────────────
export async function borrarFacturado(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('facturado').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Editar registro de vendido (vendedor) ──────────────────────────────────────
export async function editarVendido(
  id: string,
  data: {
    fecha: string;
    vistas: number;
    con_compra: number;
    sin_compra: number;
    contado: number;
    credito: number;
  }
) {
  const supabase = await createClient();
  const fechaDate = new Date(data.fecha + 'T12:00:00');
  const total = data.contado + data.credito;
  const { error } = await supabase
    .from('registros_ventas')
    .update({
      fecha_registro: data.fecha + 'T12:00:00',
      mes_periodo: fechaDate.getMonth() + 1,
      anio_periodo: fechaDate.getFullYear(),
      vistas: data.vistas,
      con_compra: data.con_compra,
      sin_compra: data.sin_compra,
      contado: data.contado,
      credito: data.credito,
      monto_facturado: total,
    })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Borrar registro de vendido (vendedor) ──────────────────────────────────────
export async function borrarVendido(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('registros_ventas').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

