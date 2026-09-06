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

export async function togglePaymentStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('fixed_payments')
    .update({ is_paid: !currentStatus })
    .eq('id', id);
    
  if (error) {
    console.error('Error toggling fixed payment status:', error);
    throw new Error('Failed to toggle fixed payment');
  }

  revalidatePath('/pagos-fijos');
}
