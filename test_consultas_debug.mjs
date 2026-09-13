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
    incomesRes,
    dailyExpensesRes,
    fixedPaymentsRes,
    profilesRes,
] = await Promise.all([
    supabase.from('incomes').select('*'),
    supabase.from('daily_expenses').select('*'),
    supabase.from('fixed_payments').select('*'),
    supabase.from('profiles').select('id, first_name, last_name'),
]);

const profilesMap = {};
if (profilesRes.data) {
  profilesRes.data.forEach(p => {
    profilesMap[p.id] = p.first_name || 'Desconocido';
  });
}

const transactions = [];

if (fixedPaymentsRes.data) {
  fixedPaymentsRes.data.forEach(pay => {
    transactions.push({
      module: 'Pagos Fijos',
      profile_id: pay.profile_id,
      responsibleName: profilesMap[pay.profile_id] || 'Desconocido',
    });
  });
}

console.log('Profiles Map:', profilesMap);
console.log('Transactions sample:', transactions.slice(0, 3));
