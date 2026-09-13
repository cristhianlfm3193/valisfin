import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) {
    let v = m[2] ? m[2].trim() : '';
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const placas = ['80799', '71310', '8-946-2084'];
  const filter = `pos_id.in.(${placas.map(p => `"${p}"`).join(',')}),cedula.in.(${placas.map(p => `"${p}"`).join(',')})`;
  console.log('Testing filter:', filter);
  const res = await supabase.from('valisan_bdrh').select('pos_id, cedula, nombre_completo').or(filter);
  console.log('Error:', res.error);
  console.log('Data:', res.data);
}

run();
