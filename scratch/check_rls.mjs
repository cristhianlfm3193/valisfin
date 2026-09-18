import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SECRET_KEY=(.+)/);
const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

async function checkQuery(query) {
  const res = await fetch(`${url}/rest/v1/rpc/check_rls`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  });
  // fallback to system tables via a direct sql query if possible
}

// Instead of RPC, let's query a known table without RLS bypass (using ANON KEY) to see if we get data.
const anonKeyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
const anonKey = anonKeyMatch[1].trim();

async function checkAnon(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    }
  });
  const data = await res.json();
  console.log(`Table ${table} with anon key:`, data);
}

await checkAnon('locales');
await checkAnon('valisven_ventas');
