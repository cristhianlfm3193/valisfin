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

async function checkVehiculos() {
  // Try inserting dummy and rollback or checking schema
  const { data, error } = await supabase.from('reporte_vehiculos').select('*').limit(0);
  console.log('Error or empty:', error);
  // Check with rpc or test insert with fake ID
  const test = await supabase.from('reporte_vehiculos').insert([{
    numero_movil: 'test',
    placa_vehiculo: 'test',
    conductor_nombre: 'test',
    conductor_id: 'test',
    correria: 'test'
  }]).select();
  console.log('Insert test result:', test);
  if (test.data && test.data[0]) {
    console.log('Columns:', Object.keys(test.data[0]));
    // Clean up
    await supabase.from('reporte_vehiculos').delete().eq('id', test.data[0].id);
  }
}

checkVehiculos();
