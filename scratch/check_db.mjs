import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SECRET_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.log("No env vars found");
  process.exit(1);
}

const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

async function checkTable(table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  if (data.error) {
    console.log(`Error reading ${table}:`, data.error);
    return;
  }
  console.log(`Table ${table} has ${data.length} rows.`);
  if (data.length > 0) {
    console.log(`First row user_id: ${data[0].user_id}`);
  }
}

await checkTable('valisven_ventas');
await checkTable('valisven_clientes');
await checkTable('valisven_licencias');
