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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.rpc('get_policies', { table_name: 'profiles' });
console.log('Policies:', data, error);

// Or run raw sql to get policies
const { data: policies, error: err2 } = await supabase.from('pg_policies').select('*').eq('tablename', 'profiles');
console.log('pg_policies:', policies, err2);
