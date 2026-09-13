import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';

// Leer .env.local
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
const key = env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function retry(fn, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fn();
      if (res && res.error) {
        if (attempt === retries) return res;
        await new Promise(r => setTimeout(r, delay * attempt));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delay * attempt));
    }
  }
}

async function run() {
  console.log('🔄 1. Cargando registros existentes de Supabase...');
  let allDb = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const res = await retry(() =>
      supabase
        .from('valisan_bdrh')
        .select('id, pos_id, cedula')
        .order('id', { ascending: true })
        .range(from, from + step - 1)
    );

    if (res.error) {
      console.error('Error al cargar la BD:', res.error.message);
      process.exit(1);
    }
    allDb = allDb.concat(res.data);
    console.log(`   Cargados ${allDb.length} registros...`);
    if (res.data.length < step) break;
    from += step;
  }
  console.log(`✅ Total registros cargados: ${allDb.length}`);

  const dbByCedula = new Map();
  const dbByPosId = new Map();
  for (const r of allDb) {
    if (r.cedula?.trim()) dbByCedula.set(r.cedula.trim(), r.id);
    if (r.pos_id?.trim()) dbByPosId.set(r.pos_id.trim(), r.id);
  }

  console.log('📂 2. Leyendo datos_rh.csv...');
  const fileStream = fs.createReadStream('./datos_rh.csv', 'utf8');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const toUpdate = []; // { id, payload }
  const toInsert = []; // payload
  let isFirst = true;
  let count = 0;

  for await (const line of rl) {
    if (isFirst) { isFirst = false; continue; }
    if (!line.trim()) continue;

    const parts = line.split(';');
    if (parts.length < 5) continue;
    count++;

    // Posición;Nombre;Apellido;Género;Cédula;Cargo;Código Cargo;Salario;Sobresueldo;Fecha de inicio;Objeto de Gasto;Estado
    const posicion = parts[0]?.trim() || '';
    const nombre = parts[1]?.trim() || '';
    const apellido = parts[2]?.trim() || '';
    const genero = parts[3]?.trim() || '';
    const cedula = parts[4]?.trim() || '';
    const cargo = parts[5]?.trim() || '';
    const codigo_cargo = parts[6]?.trim() || '';
    const salario = parseFloat(parts[7]?.trim() || '0');
    const sobresueldo = parseFloat(parts[8]?.trim() || '0');
    let fecha_inicio = parts[9]?.trim() || null;
    const objeto_gasto = parts[10]?.trim() || '';
    const estado = parts[11]?.trim() || '';

    if (fecha_inicio && !fecha_inicio.match(/^\d{4}-\d{2}-\d{2}$/)) {
      fecha_inicio = null;
    }

    const payload = {
      pos_id: posicion,
      nombre: nombre,
      apellido: apellido,
      nombre_completo: `${nombre} ${apellido}`.trim(),
      genero: genero,
      cedula: cedula,
      cargo: cargo,
      rango: cargo,
      codigo_cargo: codigo_cargo,
      salario: isNaN(salario) ? 0 : salario,
      sobresueldo: isNaN(sobresueldo) ? 0 : sobresueldo,
      fecha_inicio: fecha_inicio,
      objeto_gasto: objeto_gasto,
      estado: estado
    };

    let targetId = null;
    if (cedula && dbByCedula.has(cedula)) {
      targetId = dbByCedula.get(cedula);
    } else if (posicion && dbByPosId.has(posicion)) {
      targetId = dbByPosId.get(posicion);
    }

    if (targetId) {
      toUpdate.push({ id: targetId, payload });
    } else {
      toInsert.push(payload);
    }
  }

  console.log(`📊 Total a procesar:`);
  console.log(`   - A actualizar: ${toUpdate.length}`);
  console.log(`   - A insertar nuevos: ${toInsert.length}`);

  // Inserción de nuevos registros
  if (toInsert.length > 0) {
    console.log(`\n➕ Insertando ${toInsert.length} registros nuevos en lotes...`);
    const chunkSize = 100;
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize);
      const { error: insErr } = await retry(() => supabase.from('valisan_bdrh').insert(chunk));
      if (insErr) {
        console.error(`Error insertando lote ${i}:`, insErr.message);
      }
    }
    console.log('✅ Nuevos registros insertados con éxito.');
  }

  // Actualización paralela controlada (concurrencia 12 para no saturar connection pool)
  const concurrency = 12;
  console.log(`\n🚀 Iniciando actualización de ${toUpdate.length} registros (concurrencia: ${concurrency})...`);
  let successUpdates = 0;
  let errorUpdates = 0;
  let idx = 0;

  async function worker() {
    while (idx < toUpdate.length) {
      const current = toUpdate[idx++];
      const res = await retry(() =>
        supabase
          .from('valisan_bdrh')
          .update(current.payload)
          .eq('id', current.id)
      );

      if (res && res.error) {
        errorUpdates++;
      } else {
        successUpdates++;
      }

      const total = successUpdates + errorUpdates;
      if (total % 500 === 0 || total === toUpdate.length) {
        console.log(`   [Progreso] ${total} / ${toUpdate.length} procesados (${successUpdates} exitosos, ${errorUpdates} errores)`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log(`\n🎉 PROCESO MASIVO COMPLETADO:`);
  console.log(`   - Actualizaciones exitosas: ${successUpdates}`);
  console.log(`   - Errores: ${errorUpdates}`);
  console.log(`   - Nuevos registros creados: ${toInsert.length}`);
}

run().catch(console.error);
