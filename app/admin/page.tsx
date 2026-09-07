import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminClient from './AdminClient';
import { getAppSettings, getAllUsers } from '@/app/actions/admin';

export const metadata = {
  title: 'Admin Panel | ValisFin',
  description: 'Gestión y control de ValisFin',
};

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. Verify User Session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Verify Admin Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'administrador') {
    redirect('/unauthorized');
  }

  // 3. Fetch Data for Admin Client
  const [initialSettings, initialUsers] = await Promise.all([
    getAppSettings('login_page'),
    getAllUsers()
  ]);

  return <AdminClient initialSettings={initialSettings || {}} initialUsers={initialUsers} />;
}
