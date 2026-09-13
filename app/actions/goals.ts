'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSavingsGoals() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('savings_goals')
    .select(`
      *,
      profiles (
        first_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching savings goals:', error);
    throw new Error('Failed to fetch savings goals');
  }

  const goals = data || [];

  // Fetch pending maintenance costs to dynamically override linked goals
  const { data: maintenanceData } = await supabase
    .from('maintenance')
    .select('vehicle_id, cost')
    .eq('is_pending', true);

  if (maintenanceData && maintenanceData.length > 0) {
    const costMap: Record<string, number> = {};
    for (const log of maintenanceData) {
      if (!costMap[log.vehicle_id]) costMap[log.vehicle_id] = 0;
      costMap[log.vehicle_id] += (log.cost || 0);
    }

    // Override target_amount for linked goals
    for (const goal of goals) {
      if (goal.linked_vehicle_id) {
        goal.target_amount = costMap[goal.linked_vehicle_id] || 0;
      }
    }
  } else {
    for (const goal of goals) {
      if (goal.linked_vehicle_id) {
        goal.target_amount = 0;
      }
    }
  }

  return goals;
}

export async function addSavingsGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const title = formData.get('goal-title') as string;
  const category = formData.get('goal-category') as string;
  const target_amount = parseFloat(formData.get('target-amount') as string) || 0;
  const saved_amount = parseFloat(formData.get('current-savings') as string) || 0;
  const deadline_date = formData.get('deadline') as string;
  const priority = formData.get('priority') as string;
  const profile_id = formData.get('profile_id') as string;

  const { error } = await supabase
    .from('savings_goals')
    .insert({
      title,
      category,
      target_amount,
      saved_amount,
      deadline_date: deadline_date || null,
      priority,
      user_id: user.id,
      profile_id: profile_id || null
    });

  if (error) {
    console.error('Error adding savings goal:', error);
    throw new Error('Failed to add savings goal');
  }

  revalidatePath('/metas');
}

export async function deleteSavingsGoal(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting savings goal:', error);
    throw new Error('Failed to delete savings goal');
  }

  revalidatePath('/metas');
}

export async function updateSavingsGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const id = formData.get('id') as string;
  const title = formData.get('goal-title') as string;
  const category = formData.get('goal-category') as string;
  const target_amount = parseFloat(formData.get('target-amount') as string) || 0;
  const saved_amount = parseFloat(formData.get('current-savings') as string) || 0;
  const deadline_date = formData.get('deadline') as string;
  const priority = formData.get('priority') as string;
  const profile_id = formData.get('profile_id') as string;

  const { error } = await supabase
    .from('savings_goals')
    .update({
      title,
      category,
      target_amount,
      saved_amount,
      deadline_date: deadline_date || null,
      priority,
      profile_id: profile_id || null
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating savings goal:', error);
    throw new Error('Failed to update savings goal');
  }

  revalidatePath('/metas');
}
