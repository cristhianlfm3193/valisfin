'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CalendarEvent {
  id: string;
  title: string;
  amount?: number;
  date: string; // YYYY-MM-DD
  category: 'Ingresos' | 'Pagos Fijos' | 'Vehículos' | 'Hogar' | 'Metas' | 'Recordatorios' | 'Gastos Diarios';
  time?: string;
  isCompleted?: boolean;
}

export async function getCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const events: CalendarEvent[] = [];
  
  // To filter by month, we'll fetch all and filter in JS for simplicity (since we have derived dates like in fixed_payments), 
  // or fetch a slightly wider range. For now, fetch all active/recent.
  // In a real large app, we'd filter at the DB level, but here the datasets are small.

  // 1. Incomes (Extrapolate to current month based on their original day)
  const { data: incomes } = await supabase.from('incomes').select('*');
  if (incomes) {
    incomes.forEach(inc => {
      if (!inc.date) return;
      const incDate = new Date(inc.date);
      if (isNaN(incDate.getTime())) return; // Skip invalid dates
      
      // We extrapolate the income to happen on the same day every month
      const day = incDate.getDate();
      const daysInMonth = new Date(year, month, 0).getDate();
      const finalDay = Math.min(day, daysInMonth);
      const extrapolatedDate = new Date(year, month - 1, finalDay);
      
      // Avoid duplicates if they entered multiple incomes with same name/day? 
      // For now, let's just project all unique ones. Actually, incomes might be added every month manually.
      // If we project all of them, they might duplicate if the user logs "Quincena" every month.
      // So we can group them by 'description' and 'day' to avoid duplicating "Quincena" 5 times on the 15th.
      // But let's keep it simple first:
      events.push({
        id: `inc_${inc.id}_${year}_${month}`,
        title: inc.description || 'Ingreso',
        amount: inc.amount,
        date: extrapolatedDate.toISOString().split('T')[0],
        category: 'Ingresos',
      });
    });
  }

  // To remove duplicated extrapolated incomes (since they might log it manually every month)
  const uniqueIncomes = new Map();
  events.filter(e => e.category === 'Ingresos').forEach(e => {
    const key = `${e.title}_${e.date}`;
    if (!uniqueIncomes.has(key)) {
      uniqueIncomes.set(key, e);
    }
  });

  // Filter out the raw incomes from events and push the unique ones back
  let finalEvents = events.filter(e => e.category !== 'Ingresos');
  finalEvents.push(...Array.from(uniqueIncomes.values()));

  // 2. Fixed Payments (Extrapolate to current month based on created_at or billing_day)
  const { data: fixedPayments } = await supabase.from('fixed_payments').select('*');
  if (fixedPayments) {
    fixedPayments.forEach(fp => {
      if (!fp.created_at) return;
      const createdDate = new Date(fp.created_at);
      if (isNaN(createdDate.getTime())) return;
      
      const day = fp.billing_day || createdDate.getDate();
      const daysInMonth = new Date(year, month, 0).getDate();
      const finalDay = Math.min(day, daysInMonth);
      const extrapolatedDate = new Date(year, month - 1, finalDay);
      
      finalEvents.push({
        id: `fp_${fp.id}_${year}_${month}`,
        title: fp.title,
        amount: fp.amount,
        date: extrapolatedDate.toISOString().split('T')[0],
        category: 'Pagos Fijos',
        isCompleted: false // We can't easily track completion for past/future months without a history table
      });
    });
  }

  // 3. Vehicles (Maintenance)
  const { data: maintenance } = await supabase.from('maintenance').select('*');
  if (maintenance) {
    maintenance.forEach(m => {
      if (m.date) {
        const mDate = new Date(m.date);
        if (mDate.getFullYear() === year && mDate.getMonth() + 1 === month) {
          finalEvents.push({
            id: `veh_${m.id}`,
            title: m.service,
            amount: m.cost,
            date: m.date.split('T')[0],
            category: 'Vehículos',
            isCompleted: m.status === 'completed'
          });
        }
      }
    });
  }

  // 4. Home Tasks
  const { data: homeTasks } = await supabase.from('home_tasks').select('*');
  if (homeTasks) {
    homeTasks.forEach(ht => {
      const d = ht.estimated_date || ht.registration_date;
      if (d) {
        const htDate = new Date(d);
        if (htDate.getFullYear() === year && htDate.getMonth() + 1 === month) {
          finalEvents.push({
            id: `home_${ht.id}`,
            title: ht.title,
            amount: ht.budget,
            date: d.split('T')[0],
            category: 'Hogar',
            isCompleted: ht.status === 'Completado'
          });
        }
      }
    });
  }

  // 5. Reminders (Graceful fail if table doesn't exist yet)
  const { data: reminders, error: remError } = await supabase.from('reminders').select('*');
  if (!remError && reminders) {
    reminders.forEach(r => {
      const rDate = new Date(r.date);
      if (rDate.getFullYear() === year && rDate.getMonth() + 1 === month) {
        finalEvents.push({
          id: `rem_${r.id}`,
          title: r.title,
          amount: r.amount,
          date: r.date.split('T')[0],
          time: r.time,
          category: r.category as any || 'Recordatorios',
        });
      }
    });
  }

  // 6. Daily Expenses (Gastos Diarios) - Actuals only, no extrapolation
  const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;
  const { data: dailyExpenses } = await supabase
    .from('daily_expenses')
    .select('*')
    .like('date', `${currentMonthStr}%`);
    
  if (dailyExpenses) {
    dailyExpenses.forEach(de => {
      finalEvents.push({
        id: `de_${de.id}`,
        title: `${de.category} - ${de.description || ''}`,
        amount: de.amount,
        date: de.date,
        category: 'Gastos Diarios',
        isCompleted: true // They are actual expenses, so they are done
      });
    });
  }

  // Sort by date
  finalEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return finalEvents;
}

export async function addReminder(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get('title') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string || null;
  const amountStr = formData.get('amount') as string;
  const category = formData.get('category') as string || 'Recordatorios';
  
  const amount = amountStr ? parseFloat(amountStr) : null;

  try {
    const { error } = await supabase
      .from('reminders')
      .insert({
        title,
        date,
        time,
        amount,
        category
      });

    if (error) {
      console.error('Error inserting reminder:', error);
      return { success: false, error: 'La tabla reminders no existe o hubo un error. Corre el query SQL.' };
    }

    revalidatePath('/calendario');
    return { success: true };
  } catch (err: any) {
    console.error('Catch error:', err);
    return { success: false, error: 'Hubo un error de conexión.' };
  }
}
