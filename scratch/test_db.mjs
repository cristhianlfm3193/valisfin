import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let v = match[2] ? match[2].trim() : '';
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[match[1]] = v;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
// Priority to service role or secret key if available to bypass RLS or allow schema/inserts
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Connecting to:', url);
console.log('Available env keys:', Object.keys(env));
const supabase = createClient(url, key);

async function check() {
  const { count, error } = await supabase.from('valisan_bdrh').select('*', { count: 'exact', head: true });
  console.log('Count:', count, 'Error:', error);
  const { data: sample, error: err2 } = await supabase.from('valisan_bdrh').select('*').limit(2);
  console.log('Sample columns:', sample && sample[0] ? Object.keys(sample[0]) : null, 'Error:', err2);
  if (sample && sample[0]) console.log('Sample row 0:', sample[0]);
}

check();
