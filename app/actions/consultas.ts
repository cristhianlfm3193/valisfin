'use server';

import { createClient } from "@/lib/supabase/server";

export interface UnifiedTransaction {
  id: string;
  module: 'Ingresos' | 'Gastos Diarios' | 'Pagos Fijos' | 'Hogar & Reparaciones' | 'Vehículos' | 'Metas Familiares';
  date: string;
  concept: string;
  category: string;
  amount: number;
  type: 'in' | 'out';
  status: 'completed' | 'pending';
  responsibleName: string | null;
}

export async function getUnifiedTransactions(): Promise<UnifiedTransaction[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Fetch all parallel to save time
  const [
    incomesRes,
    dailyExpensesRes,
    fixedPaymentsRes,
    homeTasksRes,
    maintenanceRes,
    savingsGoalsRes,
    profilesRes,
    vehiclesRes
  ] = await Promise.all([
    supabase.from('incomes').select('*'),
    supabase.from('daily_expenses').select('*'),
    supabase.from('fixed_payments').select('*'),
    supabase.from('home_tasks').select('*'),
    supabase.from('maintenance').select('*'),
    supabase.from('savings_goals').select('*'),
    supabase.from('profiles').select('id, first_name, last_name'),
    supabase.from('vehicles').select('id, owner_id')
  ]);

  const profilesMap: Record<string, string> = {};
  if (profilesRes.data) {
    profilesRes.data.forEach(p => {
      profilesMap[p.id] = p.first_name || 'Desconocido';
    });
  }

  const vehiclesMap: Record<string, string> = {};
  if (vehiclesRes.data) {
    vehiclesRes.data.forEach(v => {
      vehiclesMap[v.id] = profilesMap[v.owner_id] || 'Desconocido';
    });
  }

  const transactions: UnifiedTransaction[] = [];

  // 1. Incomes
  if (incomesRes.data) {
    incomesRes.data.forEach(inc => {
      transactions.push({
        id: inc.id,
        module: 'Ingresos',
        date: inc.date_expected || inc.created_at,
        concept: inc.description || 'Ingreso',
        category: inc.category || 'General',
        amount: Number(inc.amount) || 0,
        type: 'in',
        status: inc.is_received ? 'completed' : 'pending',
        responsibleName: profilesMap[inc.profile_id] || 'Desconocido'
      });
    });
  }

  // 2. Daily Expenses
  if (dailyExpensesRes.data) {
    dailyExpensesRes.data.forEach(exp => {
      transactions.push({
        id: exp.id,
        module: 'Gastos Diarios',
        date: exp.date || exp.created_at,
        concept: exp.detail || 'Gasto',
        category: exp.category || 'General',
        amount: Number(exp.amount) || 0,
        type: 'out',
        status: 'completed',
        responsibleName: profilesMap[exp.profile_id] || 'Desconocido'
      });
    });
  }

  // 3. Fixed Payments
  if (fixedPaymentsRes.data) {
    fixedPaymentsRes.data.forEach(pay => {
      transactions.push({
        id: pay.id,
        module: 'Pagos Fijos',
        date: pay.created_at,
        concept: pay.title || 'Pago Fijo',
        category: pay.category || 'General',
        amount: Number(pay.amount) || 0,
        type: 'out',
        status: pay.is_paid ? 'completed' : 'pending',
        responsibleName: pay.responsible || 'Desconocido'
      });
    });
  }

  // 4. Home Tasks
  if (homeTasksRes.data) {
    homeTasksRes.data.forEach(task => {
      if (Number(task.budget) > 0) {
        transactions.push({
          id: task.id,
          module: 'Hogar & Reparaciones',
          date: task.registration_date || task.created_at,
          concept: task.title || 'Mantenimiento Hogar',
          category: task.area || 'Hogar',
          amount: Number(task.budget) || 0,
          type: 'out',
          status: task.status === 'Completado' ? 'completed' : 'pending',
          responsibleName: profilesMap[task.profile_id] || 'Desconocido'
        });
      }
    });
  }

  // 5. Vehicles (Maintenance)
  if (maintenanceRes.data) {
    maintenanceRes.data.forEach(maint => {
      if (Number(maint.cost) > 0) {
        transactions.push({
          id: maint.id,
          module: 'Vehículos',
          date: maint.date || maint.created_at,
          concept: maint.service || 'Servicio Vehicular',
          category: maint.type || 'Vehículo',
          amount: Number(maint.cost) || 0,
          type: 'out',
          status: maint.is_pending ? 'pending' : 'completed',
          responsibleName: vehiclesMap[maint.vehicle_id] || profilesMap[maint.user_id] || 'Desconocido'
        });
      }
    });
  }

  // 6. Savings Goals
  if (savingsGoalsRes.data) {
    savingsGoalsRes.data.forEach(goal => {
      if (Number(goal.saved_amount) > 0) {
        transactions.push({
          id: goal.id,
          module: 'Metas Familiares',
          date: goal.deadline_date || goal.created_at,
          concept: goal.title || 'Meta de Ahorro',
          category: goal.category || 'Ahorro',
          amount: Number(goal.saved_amount) || 0,
          type: 'out',
          status: goal.saved_amount >= goal.target_amount && goal.target_amount > 0 ? 'completed' : 'pending',
          responsibleName: profilesMap[goal.profile_id] || 'Familia'
        });
      }
    });
  }

  // Sort descending by date (newest first)
  transactions.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return transactions;
}
