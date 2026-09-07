'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addHomeTask(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string || null;
  const area = formData.get('area') as string;
  const priority = formData.get('priority') as string;
  const status = formData.get('status') as string;
  const budget = formData.get('budget') ? parseFloat(formData.get('budget') as string) : null;
  const profile_id = formData.get('profile_id') as string || null;
  const estimated_date = formData.get('estimated_date') as string || null;
  const registration_date = new Date().toISOString().split('T')[0];

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const { error: insertError } = await supabase
      .from('home_tasks')
      .insert({
        title,
        description,
        area,
        priority,
        status,
        budget,
        profile_id,
        estimated_date,
        registration_date,
        user_id: user.id
      });

    if (insertError) throw insertError;

    revalidatePath('/hogar');
    return { success: true };
  } catch (error: any) {
    console.error('Error in addHomeTask:', error);
    return { success: false, error: error.message || 'Failed to add home task' };
  }
}

export async function updateHomeTask(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string || null;
  const area = formData.get('area') as string;
  const priority = formData.get('priority') as string;
  const status = formData.get('status') as string;
  const budget = formData.get('budget') ? parseFloat(formData.get('budget') as string) : null;
  const profile_id = formData.get('profile_id') as string || null;
  const estimated_date = formData.get('estimated_date') as string || null;

  try {
    const updates: any = {
      title,
      description,
      area,
      priority,
      status,
      budget,
      profile_id,
      estimated_date
    };

    if (status === 'Completado') {
      updates.completion_date = new Date().toISOString().split('T')[0];
    }

    const { error } = await supabase
      .from('home_tasks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/hogar');
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateHomeTask:', error);
    return { success: false, error: error.message || 'Failed to update home task' };
  }
}

export async function markTaskCompleted(id: string) {
  const supabase = await createClient();
  const completion_date = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('home_tasks')
    .update({ 
      status: 'Completado',
      completion_date: completion_date
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/hogar');
  return { success: true };
}

export async function deleteHomeTask(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('home_tasks')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/hogar');
  return { success: true };
}
