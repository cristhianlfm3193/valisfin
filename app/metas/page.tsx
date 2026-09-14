import Link from 'next/link';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MetasClient from "./components/MetasClient";
import { getSavingsGoals } from "../actions/goals";

export const metadata = {
  title: 'Metas de Ahorro - ValisFin',
};

export default async function MetasPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  const goals = await getSavingsGoals().catch(e => {
    console.error('Error fetching Savings Goals:', e);
    return [];
  });

  return (
    <>
      <header className="bg-[#090a0f]/90 backdrop-blur border-b border-white/10/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link href="/valisfin">
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
              Metas de Ahorro
            </h2>
          </div>
        </div>
      </header>
<div className="flex flex-col min-w-0 overflow-y-auto w-full pt-4 lg:pt-8 px-4 sm:px-6 lg:px-10 pb-32 lg:pb-12 bg-[#121c27]/5/50">
      <MetasClient goals={goals} />
    </div>
      </>
  );
}
