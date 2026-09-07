'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addMileageLog(formData: FormData) {
  const supabase = await createClient();
  
  const vehicle_id = formData.get('vehicle_id') as string;
  const kmStr = formData.get('km') as string;
  const user_id = formData.get('user_id') as string;
  const date = new Date().toISOString().split('T')[0];
  
  const km = parseInt(kmStr, 10);

  // Get current km to calculate variation and update vehicle
  const { data: vehicle, error: fetchError } = await supabase
    .from('vehicles')
    .select('current_km')
    .eq('id', vehicle_id)
    .single();

  if (fetchError) {
    console.error('Error fetching vehicle:', fetchError);
    return { success: false, error: fetchError.message };
  }

  // Insert log
  const { error: insertError } = await supabase
    .from('mileage_logs')
    .insert({
      vehicle_id,
      date,
      km,
      user_id,
      source: 'manual'
    });

  if (insertError) {
    console.error('Error inserting mileage log:', insertError);
    return { success: false, error: insertError.message };
  }

  // Update vehicle current_km
  const { error: updateError } = await supabase
    .from('vehicles')
    .update({ current_km: km, km_date: date })
    .eq('id', vehicle_id);

  if (updateError) {
    console.error('Error updating vehicle km:', updateError);
    return { success: false, error: updateError.message };
  }

  revalidatePath('/vehiculos');
  return { success: true };
}

export async function addMaintenanceLog(formData: FormData) {
  const supabase = await createClient();
  
  const vehicle_id = formData.get('vehicle_id') as string;
  const service = formData.get('service') as string;
  const kmStr = formData.get('km') as string;
  const nextKmStr = formData.get('next_km') as string;
  const costStr = formData.get('cost') as string;
  const date = formData.get('date') as string;
  const shop = formData.get('shop') as string;
  const user_id = formData.get('user_id') as string;

  const km = parseInt(kmStr, 10);
  const next_km = nextKmStr ? parseInt(nextKmStr, 10) : null;
  const cost = parseFloat(costStr);

  const { error: insertError } = await supabase
    .from('maintenance')
    .insert({
      vehicle_id,
      date,
      km,
      service,
      type: 'Mantenimiento',
      cost,
      next_km,
      next_date: null,
      is_pending: false,
      shop,
      user_id,
      status: 'completed'
    });

  if (insertError) {
    console.error('Error inserting maintenance:', insertError);
    return { success: false, error: insertError.message };
  }

  revalidatePath('/vehiculos');
  return { success: true };
}

export async function addPendingMaintenance(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const vehicleId = formData.get('vehicle_id') as string;
  const service = formData.get('service') as string;
  const cost = formData.get('cost') ? parseFloat(formData.get('cost') as string) : null;
  const currentKm = parseInt(formData.get('current_km') as string);
  const notes = formData.get('notes') as string || null;
  const date = new Date().toISOString().split('T')[0];

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    // Insert into maintenance with is_pending = true
    const { error: insertError } = await supabase
      .from('maintenance')
      .insert({
        vehicle_id: vehicleId,
        date: date,
        service: service,
        km: currentKm,
        cost: cost,
        status: 'pending',
        is_pending: true,
        notes: notes,
        user_id: user.id
      });

    if (insertError) throw insertError;

    revalidatePath('/vehiculos');
    return { success: true };
  } catch (error) {
    console.error('Error in addPendingMaintenance:', error);
    return { success: false, error: 'Failed to add pending maintenance' };
  }
}

export async function markMaintenanceAsDone(id: string) {
  const supabase = await createClient();
  const date = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('maintenance')
    .update({ 
      is_pending: false, 
      status: 'completed',
      date: date // optionally update date to when it was actually done
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/vehiculos');
  return { success: true };
}

export async function deleteMaintenance(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('maintenance')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/vehiculos');
  return { success: true };
}

export async function updatePendingMaintenance(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const service = formData.get('service') as string;
  const cost = formData.get('cost') ? parseFloat(formData.get('cost') as string) : null;
  const notes = formData.get('notes') as string || null;

  try {
    const { error } = await supabase
      .from('maintenance')
      .update({
        service: service,
        cost: cost,
        notes: notes
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/vehiculos');
    return { success: true };
  } catch (error) {
    console.error('Error in updatePendingMaintenance:', error);
    return { success: false, error: 'Failed to update pending maintenance' };
  }
}

export async function updateCompletedMaintenance(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const service = formData.get('service') as string;
  const cost = formData.get('cost') ? parseFloat(formData.get('cost') as string) : null;
  const shop = formData.get('shop') as string || null;
  const date = formData.get('date') as string;
  const km = parseInt(formData.get('km') as string);

  try {
    const { error } = await supabase
      .from('maintenance')
      .update({
        service: service,
        cost: cost,
        shop: shop,
        date: date,
        km: km
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/vehiculos');
    return { success: true };
  } catch (error) {
    console.error('Error in updateCompletedMaintenance:', error);
    return { success: false, error: 'Failed to update completed maintenance' };
  }
}
