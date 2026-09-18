import fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/SUPABASE_SECRET_KEY=(.+)/);
const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

async function checkRpc() {
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: "SELECT 1" })
  });
  const text = await res.text();
  console.log(res.status, text);
}

await checkRpc();
