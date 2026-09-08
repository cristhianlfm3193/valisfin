import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
for (const line of env.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1];
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1];
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIncomes() {
  const { data, error } = await supabase.from('incomes').select('*').limit(5);
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

checkIncomes();
