require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('home_tasks')
    .select(`
      *,
      profiles (
        first_name,
        last_name
      )
    `)
    .limit(1);
    
  console.log("Error:", error);
}

test();
