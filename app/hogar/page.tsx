import Link from 'next/link';
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
    <>
      <header className="bg-[#090a0f]/90 backdrop-blur border-b border-white/10/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link href="/" title="Ir a ValisHub" className="hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-teal-400 via-emerald-400 to-pink-400 shadow-[0_0_10px_rgba(45,212,191,0.2)] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">V</span>
                  </div>
                </div>
                <span className="text-lg font-black text-white tracking-tight">
                  Valis<span className="text-emerald-400">Fin</span>
                </span>
              </div>
            </Link>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-l border-white/10 pl-3 ml-1">
              Hogar
            </h2>
          </div>
        </div>
      </header>
<div className="flex flex-col min-w-0 overflow-y-auto">
      <HogarClient tasks={tasks || []} acData={acData} />
    </div>
      </>
  );
}
