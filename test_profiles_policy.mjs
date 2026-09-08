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

// use anon key, but we need to sign in to see if we can read profiles
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Login as Cristhian
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'cristhianf3193@gmail.com',
  password: 'password123' // Just guessing if it's a test environment. If not, it will fail.
});
console.log('Auth:', authError);

