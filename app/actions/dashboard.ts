'use server';

import { createClient } from "@/lib/supabase/server";

export interface DashboardMetrics {
  paymentsDone: number;
  dailyExpenses: number;
  creditCardTotal: number;
  restauranteSpent: number;
  pendingPayments: number;
  goalsCompleted: number;
  goalsTotal: number;
  goalsPercentage: number;
  actualBalance: number;
  incomesReceived: number;
  availableEstimated: number;
}

export interface CoupleBreakdown {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  incomes: number;
  expenses: number;
  balance: number;
}

export interface UpcomingPayment {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  icon: string;
  colorClass: string;
}

export interface DashboardVehicleData {
  status: string;
  info: string;
  budgetTotal: number;
  budgetUsed: number;
  percentage: number;
}

export async function getDashboardData() {
  const supabase = await createClient();
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const currentMonthPeriod = `${d.getFullYear()}-${m}`;

  // 1. Fetch Fixed Payments
  const { data: fixedPayments } = await supabase
    .from('fixed_payments')
    .select('*')
    .order('created_at', { ascending: true });

  // 2. Fetch Daily Expenses
  const { data: dailyExpenses } = await supabase
    .from('daily_expenses')
    .select('*');

  // 3. Fetch Incomes
  const { data: incomes } = await supabase
    .from('incomes')
    .select('*')
    .order('date', { ascending: false });

  // 4. Fetch Savings Goals
  const { data: savingsGoals } = await supabase
    .from('savings_goals')
    .select('*');

  // 5. Fetch Vehicle Metrics
  const { data: vehicleMetrics } = await supabase
    .from('vehicle_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: pendingWorks } = await supabase
    .from('pending_works')
    .select('*');

  // Base Arrays
  const fp = fixedPayments || [];
  const de = dailyExpenses || [];
  const inc = incomes || [];
  const sg = savingsGoals || [];

  // Metrics Calculation
  let paymentsDone = 0;
  let pendingPayments = 0;
  fp.forEach(p => {
    if (p.is_paid) {
      if (p.period === currentMonthPeriod) paymentsDone += p.amount;
    } else {
      pendingPayments += p.amount;
    }
  });

  let dailyExpensesTotal = 0;
  let creditCardTotal = 0;
  let restauranteSpent = 0;
  de.forEach(e => {
    if (e.date.startsWith(currentMonthPeriod)) {
      if (!e.is_credit_card) {
        dailyExpensesTotal += e.amount;
      } else {
        creditCardTotal += e.amount;
      }
      
      if (e.category === 'Restaurante') {
        restauranteSpent += e.amount;
      }
    }
  });

  let incomesReceived = 0;
  inc.forEach(i => {
    if (i.date.startsWith(currentMonthPeriod)) {
      incomesReceived += i.amount;
    }
  });

  let goalsTotal = sg.length;
  let goalsCompleted = 0;
  sg.forEach(g => {
    if (g.current_amount >= g.target_amount) goalsCompleted++;
  });
  const goalsPercentage = goalsTotal > 0 ? Math.round((goalsCompleted / goalsTotal) * 100) : 0;

  // Actual Balance (Incomes - Paid Expenses/Payments - Savings)
  const actualBalance = incomesReceived - paymentsDone - dailyExpensesTotal; 
  // Available Estimated = Actual Balance - Pending Payments
  const availableEstimated = actualBalance - pendingPayments;

  const metrics: DashboardMetrics = {
    paymentsDone,
    dailyExpenses: dailyExpensesTotal,
    creditCardTotal,
    restauranteSpent,
    pendingPayments,
    goalsCompleted,
    goalsTotal,
    goalsPercentage,
    actualBalance,
    incomesReceived,
    availableEstimated
  };

  // Couple Breakdown
  let cIncomes = 0, cExpenses = 0;
  let jIncomes = 0, jExpenses = 0;

  inc.forEach(i => {
    if (i.date.startsWith(currentMonthPeriod)) {
      if (i.responsible === 'Cristhian') cIncomes += i.amount;
      else if (i.responsible === 'Jennifer') jIncomes += i.amount;
    }
  });

  de.forEach(e => {
    if (e.date.startsWith(currentMonthPeriod)) {
      if (e.responsible === 'Cristhian') cExpenses += e.amount;
      else if (e.responsible === 'Jennifer') jExpenses += e.amount;
    }
  });

  fp.forEach(p => {
    if (p.period === currentMonthPeriod && p.is_paid) {
      if (p.responsible?.includes('Cristhian') || p.responsible?.includes('CF')) cExpenses += p.amount;
      else if (p.responsible?.includes('Jennifer') || p.responsible?.includes('JC')) jExpenses += p.amount;
      else {
        // Shared expense roughly
        cExpenses += (p.amount / 2);
        jExpenses += (p.amount / 2);
      }
    }
  });

  const coupleBreakdown: CoupleBreakdown[] = [
    {
      id: "cristhian",
      name: "Cristhian Fuentes",
      role: "Co-administrador",
      initials: "CF",
      color: "brand",
      incomes: cIncomes,
      expenses: cExpenses,
      balance: cIncomes - cExpenses
    },
    {
      id: "jennifer",
      name: "Jennifer Camaño",
      role: "Co-administradora",
      initials: "JC",
      color: "teal",
      incomes: jIncomes,
      expenses: jExpenses,
      balance: jIncomes - jExpenses
    }
  ];

  // Upcoming Payments
  const now = new Date();
  const upcoming: UpcomingPayment[] = [];
  
  fp.filter(p => !p.is_paid).forEach(p => {
    // Generate due date
    const createdDate = new Date(p.created_at);
    const cycleDays = p.payment_cycle_days || 30;
    const dueDate = new Date(createdDate.getTime() + (cycleDays * 24 * 60 * 60 * 1000));
    const diffTime = dueDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let icon = '💳';
    let colorClass = 'bg-slate-100 text-slate-700';
    if (p.title.toLowerCase().includes('luz') || p.title.toLowerCase().includes('electricidad')) {
      icon = '⚡';
      colorClass = 'bg-amber-100 text-amber-700';
    } else if (p.title.toLowerCase().includes('internet')) {
      icon = '🌐';
      colorClass = 'bg-indigo-100 text-indigo-700';
    } else if (p.title.toLowerCase().includes('auto') || p.title.toLowerCase().includes('gasolina')) {
      icon = '🚗';
      colorClass = 'bg-rose-100 text-rose-700';
    } else if (p.title.toLowerCase().includes('supermercado')) {
      icon = '🛒';
      colorClass = 'bg-emerald-100 text-emerald-700';
    } else if (p.title.toLowerCase().includes('bebé') || p.title.toLowerCase().includes('guardería') || p.category === 'guarderia') {
      icon = '🍼';
      colorClass = 'bg-pink-100 text-pink-700';
    }

    upcoming.push({
      id: p.id,
      title: p.title,
      subtitle: `Vence ${daysRemaining < 0 ? 'hace ' + Math.abs(daysRemaining) : 'en ' + daysRemaining} días • ${p.subtitle}`,
      amount: p.amount,
      dueDate: dueDate.toISOString(),
      daysRemaining,
      icon,
      colorClass
    });
  });

  upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Vehicle Data
  const budgetTotal = 140; // Hardcoded budget for now, can be dynamic
  let budgetUsed = 0;
  de.forEach(e => {
    if (e.date.startsWith(currentMonthPeriod) && (e.category === 'Gasolina' || e.category === 'Transporte')) {
      budgetUsed += e.amount;
    }
  });
  
  let info = "Sin información reciente";
  if (vehicleMetrics) {
    info = `Kilometraje actual: ${vehicleMetrics.current_km} km. Próximo mantenimiento a los ${vehicleMetrics.next_maintenance_km} km.`;
  }
  
  const vPercentage = budgetTotal > 0 ? Math.min(Math.round((budgetUsed / budgetTotal) * 100), 100) : 0;
  
  const vehicleData: DashboardVehicleData = {
    status: vPercentage >= 100 ? "Límite Alcanzado" : "Al Día",
    info,
    budgetTotal,
    budgetUsed,
    percentage: vPercentage
  };

  return {
    metrics,
    coupleBreakdown,
    upcomingBills: upcoming.slice(0, 6), // Show top 6
    vehicleData
  };
}
