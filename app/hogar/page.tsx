import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HogarClient from "./components/HogarClient";

import { getACData } from "../actions/ac";

export const metadata = {
  title: 'Hogar y Mantenimiento - ValisFin',
};

export default async function HogarPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  // Fetch tasks with profile info
  const { data: tasks, error: tasksError } = await supabase
    .from('home_tasks')
    .select(`
      *,
      profiles (
        first_name
      )
    `)
    .order('registration_date', { ascending: false });

  if (tasksError) {
    console.error('Error fetching home tasks:', tasksError.message || tasksError);
  }

  const acData = await getACData().catch(e => {
    console.error('Error fetching AC Data:', e);
    return [];
  });

  return (
    <div className="flex flex-col min-w-0 overflow-y-auto">
      <HogarClient tasks={tasks || []} acData={acData} />
    </div>
  );
}
