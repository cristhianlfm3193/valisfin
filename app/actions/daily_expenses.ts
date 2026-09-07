'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface DailyExpense {
  id: string;
  date: string;
  category: string;
  detail: string;
  profile_id: string;
  profiles?: { first_name: string };
  amount: number;
  created_at?: string;
}

export async function getDailyExpenses(): Promise<DailyExpense[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('daily_expenses')
    .select('*, profiles(first_name)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching daily expenses:', error);
    return [];
  }

  return data as DailyExpense[];
}

export async function addDailyExpense(formData: FormData) {
  const supabase = await createClient();
  
  const date = formData.get('date') as string;
  const category = formData.get('category') as string;
  const detail = formData.get('detail') as string;
  const profile_id = formData.get('profile_id') as string;
  const amountStr = formData.get('amount') as string;
  const amount = parseFloat(amountStr);

  const { error } = await supabase
    .from('daily_expenses')
    .insert({
      date,
      category,
      detail,
      profile_id,
      amount
    });

  if (error) {
    console.error('Error inserting daily expense:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/gastos-diarios');
  return { success: true };
}

export async function deleteDailyExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('daily_expenses').delete().eq('id', id);
  if (error) {
    console.error('Error deleting daily expense:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/gastos-diarios');
  return { success: true };
}
