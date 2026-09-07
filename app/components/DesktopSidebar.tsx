'use client';

import { useState, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeftOpen
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
  { href: "/metas", label: "Metas de Ahorro", icon: Target },
  { href: "#consultas", label: "Consultas & Reportes", icon: BarChart2 },
];

export function DesktopSidebar({ user }: { user?: User }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('valisfin_sidebar_collapsed');
    if (stored) {
      setIsCollapsed(stored === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('valisfin_sidebar_collapsed', String(newState));
  };

  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  // Para evitar hydration mismatch, forzamos un ancho inicial hasta que esté montado
  const sidebarWidth = !mounted ? "w-64" : isCollapsed ? "w-20" : "w-64";
  const pClass = !mounted ? "p-5" : isCollapsed ? "p-3" : "p-5";

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 shrink-0 justify-between min-h-screen sticky top-0 transition-all duration-300 ease-in-out ${sidebarWidth} ${pClass}`}
      data-purpose="desktop-navigation"
    >
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar overflow-x-hidden">
        <div className={`flex items-center mb-6 px-2 ${isCollapsed ? 'justify-center mt-2' : 'justify-between'}`}>
          {!isCollapsed && (
            <Link href="/" className="shrink-0">
              <img src="/logo.svg" alt="ValisFin Logo" className="w-32 h-auto drop-shadow-sm hover:opacity-90 transition-opacity" />
            </Link>
          )}
          <button 
            onClick={toggleSidebar}
            className={`text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors ${isCollapsed ? '' : ''}`}
            aria-label="Colapsar menú lateral"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <nav aria-label="Navegación principal" className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl font-medium text-sm transition-all group overflow-hidden ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-800 font-semibold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'}`}
              >
                <Icon className={`shrink-0 w-5 h-5 ${isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"}`} />
                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`pt-4 border-t border-slate-100 flex flex-col gap-3 shrink-0 ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center rounded-xl bg-slate-50/80 ${isCollapsed ? 'p-1.5 justify-center' : 'gap-3 px-2 py-2'}`} title={isCollapsed ? fullName : undefined}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-9 h-9 rounded-full border border-slate-200 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0">
              {initial}
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {fullName}
              </p>
              <p className="text-[11px] text-slate-500 truncate">Hogar Protegido</p>
            </div>
          )}
        </div>
        <LogoutButton isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
