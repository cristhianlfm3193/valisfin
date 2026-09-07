'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CalendarEvent {
  id: string;
  title: string;
  amount?: number;
  date: string; // YYYY-MM-DD
  category: 'Ingresos' | 'Pagos Fijos' | 'Vehículos' | 'Hogar' | 'Metas' | 'Recordatorios';
  time?: string;
  isCompleted?: boolean;
}

export async function getCalendarEvents(year: number, month: number): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const events: CalendarEvent[] = [];
  
  // To filter by month, we'll fetch all and filter in JS for simplicity (since we have derived dates like in fixed_payments), 
  // or fetch a slightly wider range. For now, fetch all active/recent.
  // In a real large app, we'd filter at the DB level, but here the datasets are small.

  // 1. Incomes
  const { data: incomes } = await supabase.from('incomes').select('*');
  if (incomes) {
    incomes.forEach(inc => {
      const incDate = new Date(inc.date);
      if (incDate.getFullYear() === year && incDate.getMonth() + 1 === month) {
        events.push({
          id: `inc_${inc.id}`,
          title: inc.description || 'Ingreso',
          amount: inc.amount,
          date: inc.date.split('T')[0],
          category: 'Ingresos',
        });
      }
    });
  }

  // 2. Fixed Payments (Calculate Due Dates)
  const { data: fixedPayments } = await supabase.from('fixed_payments').select('*');
  if (fixedPayments) {
    fixedPayments.forEach(fp => {
      if (!fp.is_paid) {
        const createdDate = new Date(fp.created_at);
        const cycleDays = fp.payment_cycle_days || 30;
        const dueDate = new Date(createdDate.getTime() + (cycleDays * 24 * 60 * 60 * 1000));
        
        if (dueDate.getFullYear() === year && dueDate.getMonth() + 1 === month) {
          events.push({
            id: `fp_${fp.id}`,
            title: fp.title,
            amount: fp.amount,
            date: dueDate.toISOString().split('T')[0],
            category: 'Pagos Fijos',
            isCompleted: false
          });
        }
      }
    });
  }

  // 3. Vehicles (Maintenance)
  const { data: maintenance } = await supabase.from('maintenance').select('*');
  if (maintenance) {
    maintenance.forEach(m => {
      if (m.date) {
        const mDate = new Date(m.date);
        if (mDate.getFullYear() === year && mDate.getMonth() + 1 === month) {
          events.push({
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
          events.push({
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
        events.push({
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

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return events;
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
