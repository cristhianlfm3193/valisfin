const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env vars
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0]] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('valisven_ventas').select('*').limit(1);
  console.log('valisven_ventas:', Object.keys(data[0] || {}));
}
check();
