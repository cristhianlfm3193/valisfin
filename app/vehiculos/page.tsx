import VehiculosClient from './components/VehiculosClient';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function VehiculosPage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: true });

  const { data: mileageLogs } = await supabase
    .from('mileage_logs')
    .select('*')
    .order('date', { ascending: false });

  const { data: maintenanceLogs } = await supabase
    .from('maintenance')
    .select('*')
    .order('date', { ascending: false });

  return (
    <VehiculosClient 
      vehicles={vehicles || []} 
      mileageLogs={mileageLogs || []} 
      maintenanceLogs={maintenanceLogs || []} 
    />
  );
}
