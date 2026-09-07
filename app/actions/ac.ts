'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getACData() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  // Get units
  const { data: units, error: unitsError } = await supabase
    .from('ac_units')
    .select('*')
    .order('location', { ascending: true });

  if (unitsError) throw unitsError;

  // Get latest maintenance for each unit
  const { data: maintenance, error: maintError } = await supabase
    .from('ac_maintenance')
    .select('*')
    .order('maintenance_date', { ascending: false });

  if (maintError) throw maintError;

  // Combine
  const acData = units.map(unit => {
    const logs = maintenance.filter(m => m.unit_id === unit.id);
    const latest = logs[0] || null;
    return {
      ...unit,
      latest_maintenance: latest
    };
  });

  return acData;
}

export async function addACMaintenance(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const unit_id = formData.get('unit_id') as string;
  const maintenance_date = formData.get('maintenance_date') as string;
  const cost = parseFloat(formData.get('cost') as string) || 0;
  const technician = formData.get('technician') as string || '';
  const profile_id = formData.get('profile_id') as string;

  // Calculate next maintenance (3 months later)
  const dateObj = new Date(maintenance_date);
  dateObj.setMonth(dateObj.getMonth() + 3);
  const next_maintenance = dateObj.toISOString().split('T')[0];

  const { error } = await supabase
    .from('ac_maintenance')
    .insert({
      unit_id,
      maintenance_date,
      next_maintenance,
      cost,
      technician,
      user_id: user.id,
      profile_id: profile_id || null
    });

  if (error) {
    console.error('Error adding AC maintenance:', error);
    throw new Error('Failed to add AC maintenance');
  }

  revalidatePath('/hogar');
}
