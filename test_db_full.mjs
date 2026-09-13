import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1];
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1];
}
if (!supabaseKey) {
  for (const line of env.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1];
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  const tables = ['incomes', 'daily_expenses', 'fixed_payments', 'home_tasks', 'maintenance', 'savings_goals'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Error on ${table}:`, error.message);
    } else {
      console.log(`${table.toUpperCase()} COUNT:`, count);
    }
  }
}

checkDb();
