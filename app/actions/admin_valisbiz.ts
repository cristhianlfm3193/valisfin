'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface VendedorAdmin {
  id: string;
  nombre: string;
  ruta_asignada: string | null;
  cuota_mensual: number;
  activo: boolean;
  estado: 'activo' | 'vacaciones' | 'inactivo';
  created_at?: string;
}

// 1. Obtener todos los vendedores para el panel de administración
export async function getAllSellersAdmin(): Promise<VendedorAdmin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vendedores')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('[admin_valisbiz] Error obteniendo vendedores:', error);
    return [];
  }

  return (data || []).map((v: any) => ({
    id: v.id,
    nombre: v.nombre,
    ruta_asignada: v.ruta_asignada,
    cuota_mensual: Number(v.cuota_mensual || 0),
    activo: v.activo ?? true,
    estado: v.estado || (v.activo === false ? 'inactivo' : 'activo'),
    created_at: v.created_at,
  }));
}

// 2. Crear nuevo vendedor
export async function createSellerAction(data: {
  nombre: string;
  ruta_asignada?: string;
  cuota_mensual: number;
  estado?: 'activo' | 'vacaciones' | 'inactivo';
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  const estado = data.estado || 'activo';
  const activo = estado === 'activo';

  const { data: newSeller, error } = await supabase
    .from('vendedores')
    .insert({
      nombre: data.nombre.trim(),
      ruta_asignada: data.ruta_asignada?.trim() || null,
      cuota_mensual: data.cuota_mensual || 0,
      venta_real_acumulada: 0,
      gap_ventas: data.cuota_mensual || 0,
      porcentaje_alcance: 0,
      activo,
      estado,
    })
    .select()
    .single();

  if (error) {
    console.error('[admin_valisbiz] Error creando vendedor:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/valisbiz');
  revalidatePath('/admin');
  return { success: true, seller: newSeller };
}

// 3. Actualizar vendedor (nombre, ruta, cuota, estado)
export async function updateSellerAction(id: string, data: {
  nombre?: string;
  ruta_asignada?: string;
  cuota_mensual?: number;
  estado?: 'activo' | 'vacaciones' | 'inactivo';
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  const payload: any = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre.trim();
  if (data.ruta_asignada !== undefined) payload.ruta_asignada = data.ruta_asignada.trim() || null;
  if (data.cuota_mensual !== undefined) payload.cuota_mensual = data.cuota_mensual;
  if (data.estado !== undefined) {
    payload.estado = data.estado;
    payload.activo = data.estado === 'activo';
  }

  const { error } = await supabase
    .from('vendedores')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[admin_valisbiz] Error actualizando vendedor:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/valisbiz');
  revalidatePath('/admin');
  return { success: true };
}

// 4. Cambiar estado rápido de vendedor (activo / vacaciones / inactivo)
export async function toggleSellerStateAction(id: string, estado: 'activo' | 'vacaciones' | 'inactivo') {
  return updateSellerAction(id, { estado });
}

// 5. Configuración Rápida Reemplazo Septiembre (Joseph Domínguez → Carolina Sucre)
export async function setupSeptiembreReplacementAction(options: {
  activeSellerId: string;   // Carolina Sucre ID
  absentSellerId: string;   // Joseph Domínguez ID
  targetQuota: number;      // 20000.00
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  try {
    // A. Poner ausente/vacaciones al ausente
    await supabase
      .from('vendedores')
      .update({ estado: 'vacaciones', activo: false })
      .eq('id', options.absentSellerId);

    // B. Activar al reemplazo y asignar la cuota
    await supabase
      .from('vendedores')
      .update({ 
        estado: 'activo', 
        activo: true, 
        cuota_mensual: options.targetQuota,
        ruta_asignada: 'CHPM1 - Chorrera'
      })
      .eq('id', options.activeSellerId);

    // C. Transferir facturados/registros de septiembre 2026 al reemplazo
    await supabase
      .from('facturado')
      .update({ vendedor_id: options.activeSellerId })
      .eq('vendedor_id', options.absentSellerId)
      .eq('mes_periodo', 9)
      .eq('anio_periodo', 2026);

    await supabase
      .from('registros_ventas')
      .update({ vendedor_id: options.activeSellerId })
      .eq('vendedor_id', options.absentSellerId)
      .eq('mes_periodo', 9)
      .eq('anio_periodo', 2026);

    revalidatePath('/valisbiz');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('[admin_valisbiz] Error en reemplazo:', err);
    return { success: false, error: err.message };
  }
}
