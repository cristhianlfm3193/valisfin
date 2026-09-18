const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: locales } = await supabase.from('locales').select('id, nombre_local, vendedor_id').ilike('nombre_local', '%estrella%');
  console.log("Locales:", locales);
  const { data: vendedores } = await supabase.from('vendedores').select('id, nombre');
  console.log("Vendedores:", vendedores);
}
run();
