import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const [
  dailyExpensesRes,
  fixedPaymentsRes,
  homeTasksRes,
  maintenanceRes,
  savingsGoalsRes
] = await Promise.all([
  supabase.from('daily_expenses').select('id, profile_id').limit(5),
  supabase.from('fixed_payments').select('id, profile_id').limit(5),
  supabase.from('home_tasks').select('id, profile_id').limit(5),
  supabase.from('maintenance').select('id, user_id').limit(5),
  supabase.from('savings_goals').select('id, profile_id').limit(5),
]);

console.log('Daily Expenses:', dailyExpensesRes.data);
console.log('Fixed Payments:', fixedPaymentsRes.data);
console.log('Home Tasks:', homeTasksRes.data);
console.log('Maintenance:', maintenanceRes.data);
console.log('Savings Goals:', savingsGoalsRes.data);
