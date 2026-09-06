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

export async function generateMonthlyIncomes(targetYear?: number, targetMonth?: number) {
  const supabase = await createClient();
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  
  const year = targetYear !== undefined ? targetYear : currentYear;
  const month = targetMonth !== undefined ? targetMonth : currentMonth;

  // Si estamos consultando un mes del pasado, NO auto-generamos salarios.
  // El usuario pidió que se muestre 0 (vacío) si no hay registros.
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return;
  }
  
  // Define expected salaries and fixed incomes
  const expectedSalaries = [
    { person: 'cristhian', category: 'salario', period: 'q1', description: 'Salario Quincenal Cristhian', amount: 454.41, day: 12 },
    { person: 'cristhian', category: 'salario', period: 'q2', description: 'Salario Quincenal Cristhian', amount: 454.41, day: 27 },
    { person: 'jennifer', category: 'salario', period: 'q1', description: 'Salario Quincenal Jennifer', amount: 428.86, day: 15 },
    { person: 'jennifer', category: 'salario', period: 'q2', description: 'Salario Quincenal Jennifer', amount: 428.86, day: 30 },
    // Nuevos gastos solicitados
    { person: 'jennifer', category: 'salario', period: 'q1', description: 'Gasto de Carro Jennifer', amount: 125.00, day: 15 },
    { person: 'cristhian', category: 'salario', period: 'q1', description: 'Gastos de Representación', amount: 140.43, day: 12 },
    { person: 'cristhian', category: 'salario', period: 'q2', description: 'Gastos de Representación', amount: 140.43, day: 27 },
  ];

  // Get first and last day of target month to check existing records
  const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
  const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data: existingIncomes, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('category', 'salario')
    .gte('date_expected', firstDay)
    .lte('date_expected', lastDay);

  if (error) {
    console.error('Error fetching existing incomes for generation:', error);
    return;
  }

  const missingSalaries = expectedSalaries.filter(expected => {
    // Check if there is an existing income for this person, period, and description in this month
    const exists = existingIncomes?.some(
      inc => inc.person === expected.person && inc.period === expected.period && inc.description === expected.description
    );
    return !exists;
  });

  if (missingSalaries.length > 0) {
    const recordsToInsert = missingSalaries.map(salary => {
      // Build the date expected using the specified day
      // Handle edge cases like February 30th -> it will roll over or we cap it at last day of month
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const actualDay = Math.min(salary.day, lastDayOfMonth);
      
      // format YYYY-MM-DD
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(actualDay).padStart(2, '0');
      const dateExpected = `${year}-${mm}-${dd}`;

      return {
        person: salary.person,
        category: salary.category,
        period: salary.period,
        description: salary.description,
        amount: salary.amount,
        date_expected: dateExpected,
        is_received: false // auto-generated are always pending
      };
    });

    const { error: insertError } = await supabase
      .from('incomes')
      .insert(recordsToInsert);

    if (insertError) {
      console.error('Error auto-generating salaries:', insertError);
    }
  }
}

export async function deleteIncome(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('incomes').delete().eq('id', id);
  if (error) {
    console.error('Error deleting income:', error);
    return { success: false, error: error.message };
  }
  revalidatePath('/ingresos');
  return { success: true };
}

export async function editIncome(id: string, formData: FormData) {
  const supabase = await createClient();
  const person = formData.get('person') as string;
  const category = formData.get('income-category') as string;
  const period = formData.get('income-period') as string;
  const description = formData.get('income-title') as string;
  const amountStr = formData.get('income-amount') as string;
  const dateExpected = formData.get('income-date') as string;
  
  const amount = parseFloat(amountStr);

  const { error } = await supabase
    .from('incomes')
    .update({
      person,
      category,
      period,
      description,
      amount,
      date_expected: dateExpected
    })
    .eq('id', id);

  if (error) {
    console.error('Error editing income:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/ingresos');
  return { success: true };
}
