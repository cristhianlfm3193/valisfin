'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFixedPayments() {
  const supabase = await createClient();
  
  const { data: fixedPayments, error } = await supabase
    .from('fixed_payments')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !fixedPayments) {
    console.error('Error fetching fixed payments:', error);
    return [];
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name');

  const profilesMap: Record<string, string> = {};
  if (profiles) {
    profiles.forEach((p: any) => {
      profilesMap[p.id] = p.first_name;
    });
  }

  // Transform data to map profiles.first_name to responsible
  const mappedData = fixedPayments.map((item: any) => ({
    ...item,
    responsible: profilesMap[item.profile_id] || 'Desconocido'
  }));

  return mappedData;
}

export async function togglePaymentStatus(ids: string[], currentStatus: boolean) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const period = formData.get('period') as string;
  const amountStr = formData.get('amount') as string;
  const amount = parseFloat(amountStr);

  // Derive category/responsible/subtitle based on title (simple mapping)
  let category = 'servicios';
  let profile_id = 'edc938dc-9fbc-4573-b007-0bdb95114f95';
  let subtitle = 'Servicio variable';
  let payment_cycle_days = 30; // Default cycle
  
  if (title === 'Gasolina') {
    category = 'autos';
    profile_id = 'edc938dc-9fbc-4573-b007-0bdb95114f95';
    payment_cycle_days = 15; // Usually twice a month, but defaulting to 15 or 30
  } else if (title === 'Supermercado') {
    category = 'hogar';
    profile_id = 'edc938dc-9fbc-4573-b007-0bdb95114f95';
    payment_cycle_days = 15; // Often biweekly
  } else if (title === 'Electricidad Naturgy' || title === 'Luz') {
    category = 'servicios';
    profile_id = 'edc938dc-9fbc-4573-b007-0bdb95114f95';
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
        profile_id,
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
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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

  if (currentRecord.title !== 'Uso Tarjeta de Credito' && partialAmount >= currentRecord.amount) {
    return { success: false, error: 'Partial amount must be less than the total amount' };
  }

  const remainingAmount = currentRecord.amount - partialAmount;

  if (currentRecord.title !== 'Uso Tarjeta de Credito') {
    // 2. Update the original record to be the remaining amount
    const { error: updateError } = await supabase
      .from('fixed_payments')
      .update({ amount: remainingAmount })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating remaining amount:', updateError);
      return { success: false, error: updateError.message };
    }
  }

  // 3. Insert a new record for the paid amount
  const { error: insertError } = await supabase
    .from('fixed_payments')
    .insert({
      category: currentRecord.category,
      is_paid: true, // This is the paid part
      profile_id: currentRecord.profile_id,
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

export async function updateFixedPaymentSettings(id: string, amount: number, billing_day: number | null, title: string, profile_id?: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const payload: any = { 
    amount,
    billing_day,
    title
  };

  if (profile_id) {
    payload.profile_id = profile_id;
  }

  const { error } = await supabase
    .from('fixed_payments')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Error updating fixed payment settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/pagos-fijos');
  return { success: true };
}

export async function createFixedPayment(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const amountStr = formData.get('amount') as string;
  const billingDayStr = formData.get('billing_day') as string;
  const profile_id = formData.get('profile_id') as string || 'edc938dc-9fbc-4573-b007-0bdb95114f95';
  const amount = parseFloat(amountStr);
  const billing_day = billingDayStr ? parseInt(billingDayStr, 10) : null;

  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const period = `${d.getFullYear()}-${m}`;

  const { error } = await supabase
    .from('fixed_payments')
    .insert({
      category: 'otros',
      is_paid: false,
      profile_id,
      title,
      amount,
      subtitle: 'Obligación',
      type: 'fixed',
      billing_day,
      period
    });

  if (error) {
    console.error('Error creating fixed payment:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/pagos-fijos');
  return { success: true };
}

export async function deleteFixedPayment(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('fixed_payments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting fixed payment:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/pagos-fijos');
  revalidatePath('/'); // For dashboard metrics
  return { success: true };
}

export async function updateFixedPaymentAmount(id: string, newAmount: number) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('fixed_payments')
    .update({ amount: newAmount })
    .eq('id', id);

  if (error) {
    console.error('Error updating fixed payment amount:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/pagos-fijos');
  revalidatePath('/');
  return { success: true };
}

export async function generateMonthObligations(targetMonth: string, previousMonth: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 1. Get all unique active obligations from previous month
  const { data: previousRecords, error: prevError } = await supabase
    .from('fixed_payments')
    .select('*')
    .eq('period', previousMonth);

  if (prevError) {
    console.error('Error fetching previous month records:', prevError);
    return { success: false, error: prevError.message };
  }

  // 2. Get all obligations already in target month
  const { data: targetRecords, error: targetError } = await supabase
    .from('fixed_payments')
    .select('title')
    .eq('period', targetMonth);

  if (targetError) {
    console.error('Error fetching target month records:', targetError);
    return { success: false, error: targetError.message };
  }

  const targetTitles = new Set(targetRecords.map(r => r.title));

  // 3. Find unique titles from previous month to clone
  const uniquePrev = new Map<string, any>();
  previousRecords.forEach(r => {
    // We only clone fixed or variable. Credit Card is a special global card usually.
    if (r.title === 'Uso Tarjeta de Credito') return;
    
    // Keep the most recent representation of that title
    uniquePrev.set(r.title, r);
  });

  // 4. Create new records
  const toInsert: any[] = [];
  
  for (const [title, record] of uniquePrev.entries()) {
    if (!targetTitles.has(title)) {
      toInsert.push({
        category: record.category,
        is_paid: false,
        profile_id: record.profile_id,
        title: record.title,
        amount: record.amount,
        subtitle: record.subtitle,
        type: record.type,
        billing_day: record.billing_day,
        period: targetMonth
      });
    }
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('fixed_payments')
      .insert(toInsert);

    if (insertError) {
      console.error('Error inserting new month records:', insertError);
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath('/pagos-fijos');
  return { success: true, count: toInsert.length };
}
