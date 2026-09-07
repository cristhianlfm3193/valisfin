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
  let subtitle = 'Servicio variable';
  let payment_cycle_days = 30; // Default cycle
  
  if (title === 'Gasolina') {
    category = 'autos';
    responsible = 'Transporte • Variable';
    payment_cycle_days = 15; // Usually twice a month, but defaulting to 15 or 30
  } else if (title === 'Supermercado') {
    category = 'hogar';
    responsible = 'Compras • Variable';
    payment_cycle_days = 15; // Often biweekly
  } else if (title === 'Electricidad Naturgy' || title === 'Luz') {
    category = 'servicios';
    responsible = 'Hogar • Variable';
    subtitle = 'Servicio hogar';
    payment_cycle_days = 30;
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
        subtitle,
        period,
        type: 'variable',
        payment_cycle_days
      });

    if (insertError) {
      console.error('Error inserting variable payment:', insertError);
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath('/pagos-fijos');
  return { success: true };
}

export async function partialPayment(id: string, partialAmount: number) {
  const supabase = await createClient();
  
  // 1. Get the current record
  const { data: currentRecord, error: fetchError } = await supabase
    .from('fixed_payments')
    .select('*')
    .eq('id', id)
    .single();
    
  if (fetchError || !currentRecord) {
    console.error('Error fetching record for partial payment:', fetchError);
    return { success: false, error: 'Record not found' };
  }

  if (partialAmount >= currentRecord.amount) {
    return { success: false, error: 'Partial amount must be less than the total amount' };
  }

  const remainingAmount = currentRecord.amount - partialAmount;

  // 2. Update the original record to be the remaining amount
  const { error: updateError } = await supabase
    .from('fixed_payments')
    .update({ amount: remainingAmount })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating remaining amount:', updateError);
    return { success: false, error: updateError.message };
  }

  // 3. Insert a new record for the paid amount
  const { error: insertError } = await supabase
    .from('fixed_payments')
    .insert({
      category: currentRecord.category,
      is_paid: true, // This is the paid part
      responsible: currentRecord.responsible,
      title: currentRecord.title,
      amount: partialAmount,
      subtitle: currentRecord.subtitle,
      period: currentRecord.period,
      type: currentRecord.type
    });

  if (insertError) {
    console.error('Error inserting partial payment record:', insertError);
    // Ideally we would rollback the update here, but for simplicity we just return error
    return { success: false, error: insertError.message };
  }

  revalidatePath('/pagos-fijos');
  return { success: true };
}
