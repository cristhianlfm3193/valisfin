'use server';

import { createClient } from "@/lib/supabase/server";
import type { MetaSupervisor, Vendedor, Local, Tarea, ResumenMensualVendedor } from "@/types/valisbiz";

// Obtener datos del dashboard filtrados por mes/año
export async function getDashboardData(mes?: number, anio?: number) {
  const supabase = await createClient();
  const now = new Date();
  const targetMes = mes ?? (now.getMonth() + 1);
  const targetAnio = anio ?? now.getFullYear();

  // Fetch Vendedores (datos maestros)
  const { data: vendedores } = await supabase
    .from('vendedores')
    .select('*')
    .order('nombre', { ascending: true });

  // Fetch Locales
  const { data: locales } = await supabase
    .from('locales')
    .select('*');

  // Fetch Tareas activas
  const { data: tareas } = await supabase
    .from('tareas')
    .select(`*, vendedor:vendedores(nombre), local:locales(nombre_local, cadena)`)
    .order('fecha_programada', { ascending: true });

  // Fetch registros_ventas del mes seleccionado (lo que vendieron los vendedores)
  const { data: registrosVentas } = await supabase
    .from('registros_ventas')
    .select('*')
    .eq('mes_periodo', targetMes)
    .eq('anio_periodo', targetAnio);

  // Fetch facturado del mes seleccionado (lo que finanzas confirmó)
  const { data: facturado } = await supabase
    .from('facturado')
    .select('*')
    .eq('mes_periodo', targetMes)
    .eq('anio_periodo', targetAnio);

  // Construir resumen mensual por vendedor
  const resumenMensual: ResumenMensualVendedor[] = (vendedores || []).map(v => {
    const ventas = (registrosVentas || []).filter(r => r.vendedor_id === v.id);
    const totalVendido = ventas.reduce((acc, r) => acc + Number(r.monto_facturado), 0);
    const facturadoVendedor = (facturado || []).filter(f => f.vendedor_id === v.id);
    const totalFacturado = facturadoVendedor.reduce((acc, f) => acc + Number(f.monto_facturado), 0);
    const cuota = Number(v.cuota_mensual);
    const porcentaje = cuota > 0 ? (totalVendido / cuota) * 100 : 0;
    return {
      vendedor_id: v.id,
      nombre: v.nombre,
      ruta_asignada: v.ruta_asignada,
      cuota_mensual: cuota,
      mes_periodo: targetMes,
      anio_periodo: targetAnio,
      total_vendido: totalVendido,
      total_facturado: totalFacturado,
      porcentaje_vendido: porcentaje,
      gap_vendido: cuota - totalVendido,
    };
  });

  // Calcular metas globales del mes
  const cuotaGlobal = resumenMensual.reduce((acc, r) => acc + r.cuota_mensual, 0);
  const ventaGlobal = resumenMensual.reduce((acc, r) => acc + r.total_vendido, 0);
  const metas: MetaSupervisor = {
    cuota_global: cuotaGlobal || 85000,
    venta_global_acumulada: ventaGlobal,
    gap_global: (cuotaGlobal || 85000) - ventaGlobal,
    porcentaje_global: cuotaGlobal > 0 ? (ventaGlobal / cuotaGlobal) * 100 : 0,
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

  if (error) {
    console.error("Error updating tarea:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Registrar una venta de vendedor
export async function registrarVenta(
  vendedorId: string,
  montoFacturado: number,
  localId?: string,
  fecha?: Date
) {
  const supabase = await createClient();
  const fechaRegistro = fecha ?? new Date();
  const { error } = await supabase.from('registros_ventas').insert({
    vendedor_id: vendedorId,
    local_id: localId || null,
    monto_facturado: montoFacturado,
    fecha_registro: fechaRegistro.toISOString(),
    mes_periodo: fechaRegistro.getMonth() + 1,
    anio_periodo: fechaRegistro.getFullYear(),
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Registrar facturación de finanzas
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
