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
const { data, error } = await supabase.from('daily_expenses').select('id, profile_id').is('profile_id', null);
console.log('Daily Expenses with null profile_id:', data?.length);
const { data: data2, error: error2 } = await supabase.from('fixed_payments').select('id, profile_id').is('profile_id', null);
console.log('Fixed Payments with null profile_id:', data2?.length);
