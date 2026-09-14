import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: v } = await supabase.from('vehicles').select('*, profiles(*)').limit(1);
  console.log("Vehicles with profiles:", v);
  
  const { data: m } = await supabase.from('maintenance').select('*').limit(1);
  console.log("Maintenance cols:", m ? Object.keys(m[0]) : []);
}

test();
