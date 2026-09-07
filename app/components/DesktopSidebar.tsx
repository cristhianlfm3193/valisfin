'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Wallet,
  CreditCard,
  Car,
  Target,
  BarChart2,
  Wrench,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "./LogoutButton";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/pagos-fijos", label: "Pagos Fijos", icon: CreditCard },
  { href: "/gastos-diarios", label: "Gastos Diarios", icon: Wallet },
  { href: "/vehiculos", label: "Vehículos", icon: Car },
  { href: "/hogar", label: "Hogar", icon: Wrench },
  { href: "#metas", label: "Metas de Ahorro", icon: Target },
  { href: "#consultas", label: "Consultas & Reportes", icon: BarChart2 },
];

export function DesktopSidebar({ user }: { user?: User }) {
  const pathname = usePathname();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 p-5 shrink-0 justify-between min-h-screen sticky top-0"
      data-purpose="desktop-navigation"
    >
      <div>
        <div className="flex justify-center px-2 py-4 mb-4">
          <Link href="/">
            <img src="/logo.svg" alt="ValisFin Logo" className="w-40 h-auto drop-shadow-sm hover:opacity-90 transition-opacity" />
          </Link>
        </div>
        <nav aria-label="Navegación principal" className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition group ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-800 font-semibold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.label}
              </Link>
            );
          })}
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
