'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addIncome(formData: FormData) {
  const supabase = await createClient();
  
  const person = formData.get('person') as string;
  const category = formData.get('income-category') as string;
  const period = formData.get('income-period') as string;
  const description = formData.get('income-title') as string;
  const amountStr = formData.get('income-amount') as string;
  const dateExpected = formData.get('income-date') as string;
  const isReceived = true; // Always true for manually registered incomes as per user request

  const amount = parseFloat(amountStr);

  const { error } = await supabase
    .from('incomes')
    .insert({
      person,
      category,
      period,
      description,
      amount,
      date_expected: dateExpected,
      is_received: isReceived
    });

  if (error) {
    console.error('Error inserting income:', error);
    return { success: false, error: error.message || JSON.stringify(error) };
  }

  revalidatePath('/ingresos');
  return { success: true };
}

export async function toggleIncomeStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('incomes')
    .update({ is_received: !currentStatus })
    .eq('id', id);
    
  if (error) {
    console.error('Error toggling income status:', error);
    throw new Error('Failed to toggle income');
  }

  revalidatePath('/ingresos');
}
