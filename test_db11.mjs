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
const { data: d1 } = await supabase.from('fixed_payments').select('*').limit(1);
console.log('Fixed Payments select(*):', d1);

const { data: d2 } = await supabase.from('daily_expenses').select('*').limit(1);
console.log('Daily Expenses select(*):', d2);
