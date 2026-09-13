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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const events: CalendarEvent[] = [];
  
  // To filter by month, we'll fetch all and filter in JS for simplicity (since we have derived dates like in fixed_payments), 
  // or fetch a slightly wider range. For now, fetch all active/recent.
  // In a real large app, we'd filter at the DB level, but here the datasets are small.

  // 1. Incomes - use actual date_expected for the current month only
  const incFirstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const incLastDayDate = new Date(year, month, 0);
  const incLastDay = `${year}-${String(month).padStart(2, '0')}-${String(incLastDayDate.getDate()).padStart(2, '0')}`;

  const { data: incomes } = await supabase
    .from('incomes')
    .select('*')
    .gte('date_expected', incFirstDay)
    .lte('date_expected', incLastDay);

  if (incomes) {
    incomes.forEach(inc => {
      if (!inc.date_expected) return;
      events.push({
        id: `inc_${inc.id}`,
        title: inc.description || 'Ingreso',
        amount: parseFloat(inc.amount) || 0,
        date: inc.date_expected.split('T')[0],
        category: 'Ingresos',
        isCompleted: inc.is_received
      });
    });
  }

  // Deduplicate incomes by title + date
  const uniqueIncomes = new Map();
  events.filter(e => e.category === 'Ingresos').forEach(e => {
    const key = `${e.title}_${e.date}`;
    if (!uniqueIncomes.has(key)) uniqueIncomes.set(key, e);
  });

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
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  // Get last day of month correctly
  const lastDayDate = new Date(year, month, 0); // day=0 gives last day of previous month
  const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

  const { data: dailyExpenses, error: deError } = await supabase
    .from('daily_expenses')
    .select('*')
    .gte('date', firstDay)
    .lte('date', lastDay)
    .order('date', { ascending: true });

  console.log(`[Calendar] Daily expenses query: ${firstDay} to ${lastDay} → found ${dailyExpenses?.length ?? 0} rows. Error: ${deError?.message ?? 'none'}`);
    
  if (dailyExpenses) {
    dailyExpenses.forEach(de => {
      const title = de.detail || de.category || 'Gasto';
      finalEvents.push({
        id: `de_${de.id}`,
        title: title,
        amount: parseFloat(de.amount) || 0,
        date: de.date,
        category: 'Gastos Diarios',
        isCompleted: true
      });
    });
  }

  // 7. Metas de Ahorro
  const { data: savingsGoals } = await supabase.from('savings_goals').select('*');
  if (savingsGoals) {
    savingsGoals.forEach(goal => {
      if (goal.deadline_date) {
        const dDate = new Date(goal.deadline_date);
        if (dDate.getFullYear() === year && dDate.getMonth() + 1 === month) {
          finalEvents.push({
            id: `goal_${goal.id}`,
            title: goal.title,
            amount: goal.target_amount,
            date: goal.deadline_date.split('T')[0],
            category: 'Metas',
            isCompleted: goal.saved_amount >= goal.target_amount
          });
        }
      }
    });
  }

  // Sort by date
  finalEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return finalEvents;
}

export async function addReminder(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

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
