import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ConsultasClient from './components/ConsultasClient';
import { getUnifiedTransactions } from '@/app/actions/consultas';

export default async function ConsultasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const transactions = await getUnifiedTransactions();

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto w-full pt-4 lg:pt-8 px-4 sm:px-6 lg:px-10 pb-32 lg:pb-12 bg-slate-50/50">
      <ConsultasClient initialTransactions={transactions} />
    </div>
  );
}
