import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIncomes() {
  const { data, error } = await supabase.from('incomes').select('*');
  if (error) console.error(error);
  console.log(`Total incomes: ${data?.length}`);
  console.log(data?.slice(0, 5));
}

checkIncomes();
