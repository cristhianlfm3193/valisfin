const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0]] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log("Updating to Música...");
  await supabase.from('valisven_licencias').update({ tipo: 'Música' }).ilike('producto', '%spotify%');
  
  console.log("Updating to SVOD...");
  await supabase.from('valisven_licencias').update({ tipo: 'SVOD' }).eq('tipo', 'Streaming').neq('tipo', 'Música');
  
  console.log("Updating to Software (Office & Windows)...");
  await supabase.from('valisven_licencias').update({ tipo: 'Software' }).eq('tipo', 'Office & Windows');
  
  console.log("Updating to Software (Seguridad y Antivirus)...");
  await supabase.from('valisven_licencias').update({ tipo: 'Software' }).eq('tipo', 'Seguridad y Antivirus');
  
  console.log("Updating to Software (Diseño / Productividad)...");
  await supabase.from('valisven_licencias').update({ tipo: 'Software' }).eq('tipo', 'Diseño / Productividad');

  console.log("Done updating valisven_licencias.");
}
check();
