'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- App Settings ---

export async function getAppSettings(key: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
  return data?.value;
}

export async function updateAppSettings(key: string, value: any) {
  const supabase = await createClient();
  
  // Verify admin role first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') {
    throw new Error('Unauthorized: Requires admin role');
  }

  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value });

  if (error) {
    console.error('Error updating app settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/login');
  revalidatePath('/admin');
  return { success: true };
}

// --- User Management ---

export async function getAllUsers() {
  const supabase = await createClient();
  
  // Only admins can fetch all users
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: adminCheck } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminCheck?.role !== 'administrador') return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
  return data || [];
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') {
    throw new Error('Unauthorized: Requires admin role');
  }

  // Prevent admin from removing their own admin role
  if (user.id === userId && newRole !== 'administrador') {
    return { success: false, error: 'No puedes quitarte el rol de administrador a ti mismo.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}
