'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registrarVisita(data: { local_id: string; vendedor_id: string; estado_visita: string; fecha: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('visitas_mensuales').insert(data);
  if (error) throw new Error(error.message);
  revalidatePath('/valisbiz');
}

export async function editarVisita(id: string, data: { local_id: string; vendedor_id: string; estado_visita: string; fecha: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('visitas_mensuales').update(data).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/valisbiz');
}

export async function eliminarVisita(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('visitas_mensuales').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/valisbiz');
}

export async function crearLocal(data: { nombre_local: string; tipo: string; latitud: number; longitud: number; direccion: string | null; foto_url?: string | null; vendedor_id?: string | null; activo?: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.from('locales').insert(data);
  if (error) throw new Error(error.message);
  revalidatePath('/valisbiz');
}

export async function editarLocal(id: string, data: { nombre_local: string; tipo: string; latitud: number; longitud: number; direccion: string | null; foto_url?: string | null; vendedor_id?: string | null; activo?: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.from('locales').update(data).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/valisbiz');
}

export async function eliminarLocal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('locales').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/valisbiz');
}
