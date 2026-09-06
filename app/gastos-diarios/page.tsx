import { getDailyExpenses } from '@/app/actions/daily_expenses';
import { GastosDiariosClient } from './components/GastosDiariosClient';

export const dynamic = 'force-dynamic';

export default async function GastosDiariosPage() {
  const initialExpenses = await getDailyExpenses();

  return (
    <div className="p-4 sm:p-6 w-full max-w-7xl mx-auto min-h-screen pb-24 min-w-0 overflow-x-hidden">
      <GastosDiariosClient initialExpenses={initialExpenses} />
    </div>
  );
}
