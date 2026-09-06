import { createClient } from "@/lib/supabase/server";
import { MobileMenuDrawer } from "../components/MobileMenuDrawer";
import { initialFixedPayments } from "@/lib/mockData";
import { PagosFijosClient } from "./components/PagosFijosClient";

export default async function PagosFijosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="md:hidden">
            <MobileMenuDrawer avatarUrl={avatarUrl} fullName={fullName} initial={initial} />
          </div>
          <span className="hidden md:inline-flex h-8 w-8 rounded-lg bg-emerald-600 text-white font-bold items-center justify-center text-xs shadow-sm">
            FF
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Finanzas Hogar</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-slate-600 font-medium">Mes en Curso</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">
              Pagos y Obligaciones
            </h2>
          </div>
        </div>

        {/* Icono de Notificaciones / Campana limpia */}
        <div className="flex items-center space-x-2">
          <button
            aria-label="Notificaciones"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto pb-24 md:pb-12">
        <PagosFijosClient initialPayments={initialFixedPayments as any} />
      </main>
    </>
  );
}
