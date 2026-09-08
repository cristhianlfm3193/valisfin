import { createClient } from "@/lib/supabase/server";
import { getFixedPayments } from "@/app/actions/fixed_payments";
import { getDailyExpenses } from "@/app/actions/daily_expenses";
import { PagosFijosClient } from "./components/PagosFijosClient";
import Link from "next/link";
import { Bell } from "lucide-react";

export default async function PagosFijosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  const fixedPayments = await getFixedPayments();
  const dailyExpenses = await getDailyExpenses();

  return (
    <>
      <header className="bg-white/80 backdrop-blur border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link href="/">
              <img src="/logo.svg" alt="ValisFin Logo" className="h-10 sm:h-12 w-auto lg:hidden drop-shadow-sm hover:opacity-90 transition-opacity" />
            </Link>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight hidden sm:block border-l border-slate-200 pl-3 ml-1">
              Pagos Fijos
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Icono de Notificaciones / Campana limpia */}
          <button
            aria-label="Notificaciones"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
            type="button"
          >
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
        <PagosFijosClient initialPayments={fixedPayments as any} initialDailyExpenses={dailyExpenses as any} />
      </main>
    </>
  );
}
