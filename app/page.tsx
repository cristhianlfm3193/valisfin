import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MobileMenuDrawer } from "./components/MobileMenuDrawer";
import { getDashboardData } from "./actions/dashboard";
import { getFixedPayments } from "./actions/fixed_payments";
import { DashboardClient } from "./components/DashboardClient";

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
        className="bg-white/80 backdrop-blur border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between"
        data-purpose="top-header"
      >
        <div className="flex items-center gap-3">
          <MobileMenuDrawer avatarUrl={avatarUrl} fullName={fullName} initial={initial} />
          <div className="flex items-center gap-2">
            <Link href="/">
              <img src="/logo.svg" alt="ValisFin Logo" className="h-10 sm:h-12 w-auto lg:hidden drop-shadow-sm hover:opacity-90 transition-opacity" />
            </Link>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight hidden sm:block border-l border-slate-200 pl-3 ml-1">
              Panel de Control
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentMonth}</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
        />
      </main>
    </>
  );
}
