const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const keyMatch = content.match(/SUPABASE_SECRET_KEY\s*=\s*(.*)/);
if (keyMatch) {
  const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');
  const parts = key.split('.');
  if (parts.length === 3) {
    console.log('JWT payload:', Buffer.from(parts[1], 'base64').toString());
  } else {
    console.log('Key length:', key.length, 'prefix:', key.substring(0, 10));
  }
}
