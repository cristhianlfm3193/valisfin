import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: profiles, error } = await supabase.from('profiles').select('*');
console.log('Profiles via anon:', profiles);

const profilesMap = {};
if (profiles) {
  profiles.forEach(p => {
    profilesMap[p.id] = p.first_name || 'Desconocido';
  });
}
console.log('Profiles Map:', profilesMap);
