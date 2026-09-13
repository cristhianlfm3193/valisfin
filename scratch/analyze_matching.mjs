import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';

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

async function analyze() {
  // 1. Fetch all DB records (id, pos_id, cedula)
  let allDb = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('valisan_bdrh')
      .select('id, pos_id, cedula')
      .range(from, from + step - 1);
    if (error) {
      console.error('Error fetching DB:', error);
      break;
    }
    allDb = allDb.concat(data);
    if (data.length < step) break;
    from += step;
  }
  console.log(`DB total records fetched: ${allDb.length}`);

  const dbByCedula = new Map();
  const dbByPosId = new Map();
  let dbCedulaDupes = 0;
  let dbPosDupes = 0;

  for (const r of allDb) {
    const c = r.cedula?.trim();
    const p = r.pos_id?.trim();
    if (c) {
      if (dbByCedula.has(c)) dbCedulaDupes++;
      else dbByCedula.set(c, r.id);
    }
    if (p) {
      if (dbByPosId.has(p)) dbPosDupes++;
      else dbByPosId.set(p, r.id);
    }
  }
  console.log(`DB unique cedulas: ${dbByCedula.size} (dupes: ${dbCedulaDupes})`);
  console.log(`DB unique pos_ids: ${dbByPosId.size} (dupes: ${dbPosDupes})`);

  // 2. Read CSV
  const fileStream = fs.createReadStream('./datos_rh.csv', 'utf8');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let csvCount = 0;
  let matchByCedula = 0;
  let matchByPosOnly = 0;
  let notFound = 0;
  let isFirst = true;

  for await (const line of rl) {
    if (isFirst) { isFirst = false; continue; }
    if (!line.trim()) continue;
    csvCount++;
    const parts = line.split(';');
    const pos = parts[0]?.trim();
    const cedula = parts[4]?.trim();

    if (cedula && dbByCedula.has(cedula)) {
      matchByCedula++;
    } else if (pos && dbByPosId.has(pos)) {
      matchByPosOnly++;
    } else {
      notFound++;
    }
  }

  console.log(`CSV total rows: ${csvCount}`);
  console.log(`Matches by Cédula: ${matchByCedula}`);
  console.log(`Matches by Posición (cédula no coincidió o vacía): ${matchByPosOnly}`);
  console.log(`New records (to insert): ${notFound}`);
}

analyze();
