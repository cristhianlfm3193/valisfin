'use server';

import { createClient } from "@/lib/supabase/server";
import type { MetaSupervisor, Vendedor, Local, Tarea, ResumenMensualVendedor } from "@/types/valisbiz";

export async function getDashboardData(mes?: number, anio?: number) {
  const supabase = await createClient();
  const now = new Date();
  const targetMes = mes ?? (now.getMonth() + 1);
  const targetAnio = anio ?? now.getFullYear();

  // Vendedores (datos maestros)
  const { data: vendedores } = await supabase
    .from('vendedores')
    .select('*')
    .order('nombre', { ascending: true });

  // Locales
  const { data: locales } = await supabase
    .from('locales')
    .select('*');

  // Tareas
  const { data: tareas } = await supabase
    .from('tareas')
    .select(`*, vendedor:vendedores(nombre), local:locales(nombre_local, cadena)`)
    .order('fecha_programada', { ascending: true });

  // FACTURADO del mes (Finanzas) → base oficial para % y bono
  const { data: facturado } = await supabase
    .from('facturado')
    .select('*')
    .eq('mes_periodo', targetMes)
    .eq('anio_periodo', targetAnio);

  // VENDIDO REPORTADO del mes (Vendedores) → solo informativo
  const { data: registrosVentas } = await supabase
    .from('registros_ventas')
    .select('*')
    .eq('mes_periodo', targetMes)
    .eq('anio_periodo', targetAnio);

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
  fecha?: Date
) {
  const supabase = await createClient();
  const fechaRegistro = fecha ?? new Date();
  const { error } = await supabase.from('registros_ventas').insert({
    vendedor_id: vendedorId,
    local_id: localId || null,
    monto_facturado: montoVendido, // campo heredado, representa lo que el vendedor reportó
    fecha_registro: fechaRegistro.toISOString(),
    mes_periodo: fechaRegistro.getMonth() + 1,
    anio_periodo: fechaRegistro.getFullYear(),
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Registrar facturación oficial de Finanzas (base para bono y cuota)
export async function registrarFacturado(
  vendedorId: string,
  montoFacturado: number,
  fecha: Date,
  notas?: string
) {
  const supabase = await createClient();
  const { error } = await supabase.from('facturado').insert({
    vendedor_id: vendedorId,
    monto_facturado: montoFacturado,
    fecha: fecha.toISOString().split('T')[0],
    mes_periodo: fecha.getMonth() + 1,
    anio_periodo: fecha.getFullYear(),
    notas: notas || null,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
