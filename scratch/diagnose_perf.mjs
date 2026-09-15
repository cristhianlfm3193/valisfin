import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length > 0) {
    env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function measureQuery(name, queryFn) {
  const start = performance.now();
  try {
    const res = await queryFn();
    const duration = Math.round(performance.now() - start);
    const count = Array.isArray(res.data) ? res.data.length : (res.count ?? (res.data ? 1 : 0));
    return { name, duration, count, error: res.error ? res.error.message : null };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return { name, duration, error: err.message };
  }
}

async function run() {
  console.log('--- DIAGNOSTICO DE RENDIMIENTO SUPABASE ---');
  console.log('Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL);

  const tests = [
    ['profiles count', () => supabase.from('profiles').select('*', { count: 'exact', head: true })],
    ['fixed_payments all', () => supabase.from('fixed_payments').select('*')],
    ['daily_expenses all', () => supabase.from('daily_expenses').select('*')],
    ['incomes all', () => supabase.from('incomes').select('*')],
    ['savings_goals all', () => supabase.from('savings_goals').select('*')],
    ['vehicles all', () => supabase.from('vehicles').select('*')],
    ['maintenance all', () => supabase.from('maintenance').select('*')],
    ['home_tasks all', () => supabase.from('home_tasks').select('*')],
    ['locales all', () => supabase.from('locales').select('*')],
    ['vendedores all', () => supabase.from('vendedores').select('*')],
    ['visitas_mensuales all', () => supabase.from('visitas_mensuales').select('*')],
    ['facturado all', () => supabase.from('facturado').select('*')],
    ['registros_ventas all', () => supabase.from('registros_ventas').select('*')],
    ['reportes count', () => supabase.from('reportes').select('*', { count: 'exact', head: true })],
    ['reporte_unidades count', () => supabase.from('reporte_unidades').select('*', { count: 'exact', head: true })],
    ['reporte_vehiculos count', () => supabase.from('reporte_vehiculos').select('*', { count: 'exact', head: true })],
    ['valisan_bdrh count', () => supabase.from('valisan_bdrh').select('*', { count: 'exact', head: true })],
    ['valisan_bdrh 1000 rows', () => supabase.from('valisan_bdrh').select('*').limit(1000)],
  ];

  for (const [name, fn] of tests) {
    const result = await measureQuery(name, fn);
    console.log(`${result.name.padEnd(25)} | ${String(result.duration).padStart(5)}ms | filas: ${String(result.count ?? '-').padStart(5)} | err: ${result.error ?? 'OK'}`);
  }
}

run();
