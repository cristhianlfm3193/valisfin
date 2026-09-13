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

async function testSearch() {
  const placas = ['81320', '83404', '72213', '1064'];
  for (const p of placas) {
    const { data } = await supabase.from('valisan_bdrh').select('id, pos_id, rango, cargo, nombre_completo, cedula, base, departamento').eq('pos_id', p);
    console.log(`Placa ${p}:`, data);
  }
}

testSearch();
