'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFixedPayments() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('fixed_payments')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching fixed payments:', error);
    return [];
  }

  return data;
}

export async function togglePaymentStatus(ids: string[], currentStatus: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('fixed_payments')
    .update({ is_paid: !currentStatus })
    .in('id', ids);
    
  if (error) {
    console.error('Error toggling fixed payment status:', error);
    throw new Error('Failed to toggle fixed payment');
  }

  revalidatePath('/pagos-fijos');
}

export async function addVariablePayment(formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get('title') as string;
  const period = formData.get('period') as string;
  const amountStr = formData.get('amount') as string;
  const amount = parseFloat(amountStr);

  // Derive category/responsible/subtitle based on title (simple mapping)
  let category = 'servicios';
  let responsible = 'Hogar • Variable';
  
  if (title === 'Gasolina') {
    category = 'autos';
    responsible = 'Transporte • Variable';
  } else if (title === 'Supermercado') {
    category = 'hogar';
    responsible = 'Compras • Variable';
  }

  // Check if there is already an unpaid record for this title and period
  const { data: existing } = await supabase
    .from('fixed_payments')
    .select('id')
    .eq('title', title)
    .eq('period', period)
    .eq('is_paid', false)
    .limit(1)
    .single();

  if (existing) {
    // Update existing
    const { error: updateError } = await supabase
      .from('fixed_payments')
      .update({ amount })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Error updating variable payment:', updateError);
      return { success: false, error: updateError.message };
    }
  } else {
    // Insert new
    const { error: insertError } = await supabase
      .from('fixed_payments')
      .insert({
        category,
        is_paid: false,
        responsible,
        title,
        amount,
        subtitle: 'Servicio variable',
        period,
        type: 'variable'
      });

    if (insertError) {
      console.error('Error inserting variable payment:', insertError);
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath('/pagos-fijos');
  return { success: true };
}
