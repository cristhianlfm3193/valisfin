import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) {
    env[key.trim()] = val.join('=').trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);

const csvPath = 'C:\\Users\\crist\\.gemini\\antigravity-ide\\brain\\a6499489-f64f-494d-81fd-4887084a4a0a\\.user_uploaded\\media_1789291446236.csv';

async function run() {
  const csvContent = fs.readFileSync(csvPath, 'latin1').replace(/\r/g, '');
  const lines = csvContent.split('\n');
  
  let validRecords = [];
  
  // Skip header, parse lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.includes(';')) continue;
    
    const parts = line.split(';');
    if (parts.length < 5) continue;

    validRecords.push({
      pos_id: parts[1] || '',
      rango: parts[2] || '',
      nombre_completo: parts[3] || '',
      cedula: parts[4] || '',
      grupo_pd: parts[5] || '',
      turno: parts[6] || '',
      base: parts[7] || '',
      direccion: parts[8] || '',
      jef: parts[9] || '',
      departamento: parts[10] || ''
    });
  }

  console.log(`Found ${validRecords.length} records. Starting upload...`);

  // We can't TRUNCATE via supabase-js unless we have an RPC, so we just delete everything
  console.log('Clearing existing data...');
  const { error: delError } = await supabase.from('valisan_bdrh').delete().neq('id', 0);
  if (delError) {
    console.error('Error clearing data:', delError);
  }

  // Batch insert in chunks of 500
  const batchSize = 500;
  for (let i = 0; i < validRecords.length; i += batchSize) {
    const batch = validRecords.slice(i, i + batchSize);
    let retries = 3;
    while (retries > 0) {
      const { error } = await supabase.from('valisan_bdrh').insert(batch);
      if (error) {
        console.error(`Error inserting batch ${i}:`, error.message || error);
        retries--;
        if (retries === 0) process.exit(1);
        console.log(`Retrying batch ${i}...`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        break;
      }
    }
    console.log(`Uploaded batch ${i} to ${i + batch.length}`);
    await new Promise(r => setTimeout(r, 1000)); // Sleep 1s to prevent rate limits
  }

  console.log('Upload complete!');
}

run();
