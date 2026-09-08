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
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log("PROFILES:", profiles);
  
  const { count: incomesCount } = await supabase.from('incomes').select('*', { count: 'exact', head: true });
  console.log("INCOMES COUNT:", incomesCount);
  
  const { data: expenses } = await supabase.from('daily_expenses').select('id, profile_id').limit(1);
  console.log("EXPENSE SAMPLE:", expenses);
}

checkDb();
