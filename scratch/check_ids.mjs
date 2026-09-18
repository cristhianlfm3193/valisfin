import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SECRET_KEY=(.+)/);
const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

async function checkIds(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id,user_id&limit=3`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log(`Table ${table}:`, data);
}

await checkIds('locales');
await checkIds('valisven_ventas');
