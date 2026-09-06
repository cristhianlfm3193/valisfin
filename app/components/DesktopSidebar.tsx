import Link from "next/link";
import {
  Home,
  TrendingUp,
  Wallet,
  CreditCard,
  Car,
  Target,
  BarChart2,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "./LogoutButton";

export function DesktopSidebar({ user }: { user?: User }) {
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 p-5 shrink-0 justify-between min-h-screen sticky top-0"
      data-purpose="desktop-navigation"
    >
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-emerald-700/20">
            FC
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              Familia Fuentes Camaño
            </h1>
            <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Finanzas del Hogar
            </span>
          </div>
        </div>
        <nav aria-label="Navegación principal" className="space-y-1.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-sm transition group"
          >
            <Home className="w-5 h-5 text-emerald-700" />
            Inicio
          </Link>
          <Link
            href="#ingresos"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition group"
          >
            <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Ingresos
          </Link>
          <Link
            href="#pagos"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition group"
          >
            <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Pagos Fijos
          </Link>
          <Link
            href="#gastos"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition group"
          >
            <Wallet className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Gastos Diarios
          </Link>
          <Link
            href="#vehiculos"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition group"
          >
            <Car className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Vehículos
          </Link>
          <Link
            href="#metas"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition group"
          >
            <Target className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Metas de Ahorro
          </Link>
          <Link
            href="#consultas"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition group"
          >
            <BarChart2 className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            Consultas & Reportes
          </Link>
        </nav>
      </div>
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50/80">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-9 h-9 rounded-full border border-slate-200" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-xs">
              {initial}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {fullName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">Hogar Protegido</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
