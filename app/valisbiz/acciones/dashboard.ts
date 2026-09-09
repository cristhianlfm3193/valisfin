'use server';

import { createClient } from "@/lib/supabase/server";
import type { MetaSupervisor, Vendedor, Local, Tarea } from "@/types/valisbiz";

export async function getDashboardData() {
  const supabase = await createClient();

  // Fetch Meta Supervisor (Vista)
  const { data: metas } = await supabase
    .from('metas_supervisor')
    .select('*')
    .single();

  // Fetch Vendedores
  const { data: vendedores } = await supabase
    .from('vendedores')
    .select('*')
    .order('porcentaje_alcance', { ascending: false });

  // Fetch Locales
  const { data: locales } = await supabase
    .from('locales')
    .select('*');

  // Fetch Tareas activas
  const { data: tareas } = await supabase
    .from('tareas')
    .select(`
      *,
      vendedor:vendedores(nombre),
      local:locales(nombre_local, cadena)
    `)
    .order('fecha_programada', { ascending: true });

  return {
    metas: (metas as MetaSupervisor) || { cuota_global: 85000, venta_global_acumulada: 0, gap_global: 85000, porcentaje_global: 0 },
    vendedores: (vendedores as Vendedor[]) || [],
    locales: (locales as Local[]) || [],
    tareas: (tareas as any[]) || []
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
