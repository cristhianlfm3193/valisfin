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

async function check() {
  const { data: d1 } = await supabase.from('valisan_bdrh').select('pos_id, cedula, nombre_completo, cargo').ilike('cedula', '%946-2084%');
  console.log('Search by cedula 946-2084:', d1);
  const { data: d2 } = await supabase.from('valisan_bdrh').select('pos_id, cedula, nombre_completo, cargo').ilike('nombre_completo', '%Barria%');
  console.log('Search by name Barria (sample 3):', d2?.slice(0, 3));
}

check();
