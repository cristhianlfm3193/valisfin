import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "../actions/dashboard";
import { getFixedPayments } from "../actions/fixed_payments";
import { DashboardClient } from "../components/DashboardClient";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  const dashboardData = await getDashboardData();
  const fixedPayments = await getFixedPayments();
  const { data: vehicles } = await supabase.from('vehicles').select('*');

  const d = new Date();
  const monthName = d.toLocaleString('es-ES', { month: 'long' });
  const currentMonth = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${d.getFullYear()}`;

  return (
    <>
      <header
        className="bg-[#090a0f]/80 backdrop-blur border-b border-white/10 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between"
        data-purpose="top-header"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link href="/valisfin">
              <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-teal-400 via-emerald-400 to-pink-400 shadow-[0_0_10px_rgba(45,212,191,0.3)] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">V</span>
                  </div>
                </div>
                <span className="text-lg font-black text-white tracking-tight drop-shadow-md">
                  Valis<span className="text-emerald-400">Fin</span>
                </span>
              </div>
            </Link>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-l border-white/10 pl-3 ml-1">
              Panel de Control
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-[#121c27]/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{currentMonth}</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            <span>Sincronizado</span>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
        <DashboardClient 
          metrics={dashboardData.metrics}
          coupleBreakdown={dashboardData.coupleBreakdown}
          upcomingBills={dashboardData.upcomingBills}
          vehicleData={dashboardData.vehicleData}
          vehicles={vehicles || []}
          fixedPayments={fixedPayments || []}
          currentUserEmail={user?.email || ''}
          currentUserName={fullName}
        />
      </main>
    </>
  );
}
