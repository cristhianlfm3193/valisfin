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
  const r1 = await supabase.from('reportes').select('*').limit(1);
  console.log('reportes cols:', r1.data ? Object.keys(r1.data[0] || {}) : r1.error);
  if (r1.data && r1.data[0]) console.log('reportes sample:', r1.data[0]);

  const r2 = await supabase.from('reporte_vehiculos').select('*').limit(1);
  console.log('reporte_vehiculos cols:', r2.data ? Object.keys(r2.data[0] || {}) : r2.error);
  if (r2.data && r2.data[0]) console.log('reporte_vehiculos sample:', r2.data[0]);

  const r3 = await supabase.from('reporte_unidades').select('*').limit(1);
  console.log('reporte_unidades cols:', r3.data ? Object.keys(r3.data[0] || {}) : r3.error);
  if (r3.data && r3.data[0]) console.log('reporte_unidades sample:', r3.data[0]);
}

check();
