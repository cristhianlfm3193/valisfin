const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  console.log("Starting Admin Setup...");

  // 1. Create or ensure emergency admin exists
  const emergencyEmail = 'cristhianlf3193@gmail.com';
  const emergencyPassword = 'AdminPassword123!'; // We'll tell the user to change it, or they can use 'olvidé contraseña'
  
  // Try to create the user
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: emergencyEmail,
    password: emergencyPassword,
    email_confirm: true
  });

  let emergencyUserId = null;

  if (createError) {
    if (createError.message.includes('already exists')) {
      console.log('Emergency user already exists in Auth.');
      // Find the ID
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const u = users.find(u => u.email === emergencyEmail);
      if (u) emergencyUserId = u.id;
    } else {
      console.error('Error creating emergency user:', createError);
    }
  } else {
    console.log('Emergency user created successfully.');
    emergencyUserId = newUser.user.id;
  }

  // Ensure profile exists for emergency user
  if (emergencyUserId) {
    const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', emergencyUserId).single();
    if (!profile) {
      await supabase.from('profiles').insert({
        id: emergencyUserId,
        email: emergencyEmail,
        first_name: 'Admin Local',
        role: 'administrador',
        is_active: true
      });
      console.log('Emergency profile created.');
    } else {
      await supabase.from('profiles').update({ role: 'administrador' }).eq('id', emergencyUserId);
      console.log('Emergency profile updated to administrador.');
    }
  }

  // 2. Elevate cristhianf3193@gmail.com to administrador
  const primaryEmail = 'cristhianf3193@gmail.com';
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'administrador' })
    .eq('email', primaryEmail);

  if (updateError) {
    console.error('Error updating primary profile role:', updateError);
  } else {
    console.log(`Updated ${primaryEmail} to administrador.`);
  }

  console.log("Admin Setup Complete.");
}

main();
