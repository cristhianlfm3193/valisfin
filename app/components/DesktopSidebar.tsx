'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  PanelLeftOpen,
  Calendar,
  Shield,
  MapPin,
  Heart,
  Orbit,
  Sparkles,
  BarChart3,
  Store,
  Menu,
  X,
  Phone,
  MessageSquare,
  Plug,
  Bot
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "./LogoutButton";
import { ValisBizSettingsModal } from "@/app/admin/components/ValisBizSettingsModal";

const navItems = [
  { href: "/valisfin", label: "Inicio", icon: Home },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/pagos-fijos", label: "Pagos Fijos", icon: CreditCard },
  { href: "/gastos-diarios", label: "Gastos Diarios", icon: Wallet },
  { href: "/vehiculos", label: "Vehículos", icon: Car },
  { href: "/hogar", label: "Hogar", icon: Wrench },
  { href: "/metas", label: "Metas de Ahorro", icon: Target },
  { href: "/calendario", label: "Calendario Financiero", icon: Calendar },
  { href: "/consultas", label: "Consultas & Reportes", icon: BarChart2 },
];

export function DesktopSidebar({ user, profile }: { user?: User, profile?: any }) {
  return (
    <Suspense fallback={<aside className="hidden lg:flex flex-col bg-[#121c27]/5 border-r border-white/10 backdrop-blur-xl shrink-0 h-screen max-h-screen sticky top-0 self-start w-64 p-5" />}>
      <DesktopSidebarInner user={user} profile={profile} />
    </Suspense>
  );
}

function DesktopSidebarInner({ user, profile }: { user?: User, profile?: any }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsedState, setIsCollapsedState] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isValisBizOpen, setIsValisBizOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isCollapsed = isMobileOpen ? false : isCollapsedState;

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('valisfin_sidebar_collapsed');
    if (stored) {
      setIsCollapsedState(stored === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsedState;
    setIsCollapsedState(newState);
    localStorage.setItem('valisfin_sidebar_collapsed', String(newState));
  };

  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  const sidebarWidth = !mounted ? "w-64" : isCollapsed ? "w-20" : "w-64";
  const pClass = !mounted ? "p-5" : isCollapsed ? "p-3" : "p-5";

  const isValisBiz = pathname.startsWith('/valisbiz');
  const isValisAN = pathname.startsWith('/valisan');
  const isValisChat = pathname.startsWith('/whatsapp') || pathname.startsWith('/conectores') || pathname.startsWith('/agente');
  const currentTab = searchParams.get('tab') || 'ventas';
  const valisANCurrentTab = searchParams.get('tab') || 'dashboard';
  const isAdmin = pathname.startsWith('/admin');

  const valisChatNavItems = [
    { href: "/whatsapp", label: "Chat", icon: MessageSquare, id: 'chat' },
    { href: "/conectores", label: "Conectores", icon: Plug, id: 'conectores' },
    { href: "/agente", label: "Agente IA", icon: Bot, id: 'agente' },
  ];

  const valisHubNavItems = [
    { href: "/valisfin", label: "ValisFin", icon: Home, id: 'valisfin' },
    { href: "/valisbiz", label: "ValisBiz", icon: Store, id: 'valisbiz' },
    { href: "/valisan", label: "ValisAN", icon: BarChart3, id: 'valisan' },
    { href: "/whatsapp", label: "ValisChat", icon: Phone, id: 'whatsapp' },
  ];

  const valisBizNavItems = [
    { href: "/valisbiz?tab=ventas", label: "Ventas & Métricas", icon: TrendingUp, id: 'ventas' },
    { href: "/valisbiz?tab=estadisticas", label: "Estadísticas", icon: BarChart2, id: 'estadisticas' },
    { href: "/valisbiz?tab=mapa", label: "Mapa de Visitas", icon: MapPin, id: 'mapa' },
  ];

  const valisANNavItems = [
    { href: "/valisan?tab=dashboard", label: "Dashboard", icon: BarChart2, id: 'dashboard' },
    { href: "/valisan?tab=aipp", label: "AIPP (Reportes)", icon: Target, id: 'aipp' },
    { href: "/valisan?tab=bdrh", label: "BD-RH (Personal)", icon: Shield, id: 'bdrh' },
  ];

  const currentNavItems = isValisChat 
    ? valisChatNavItems 
    : (isValisBiz ? valisBizNavItems : (isValisAN ? valisANNavItems : (isAdmin ? valisHubNavItems : navItems)));

  const colorClasses = isValisChat
    ? { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' }
    : isValisBiz 
      ? { text: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-500/10' }
      : isValisAN
        ? { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10' }
        : { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' };

  if (pathname === '/' || pathname.startsWith('/valisven')) {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden w-full h-20 bg-[#090a0f]/95 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-40 sticky top-0 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <Link href="/" title="Ir a ValisHub" className="flex items-center gap-3">
          {isValisChat ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-[#090a0f] rounded-[14px] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-white tracking-tight">Valis<span className="text-emerald-400">Chat</span></span>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  WhatsApp Business
                </p>
              </div>
            </div>
          ) : isValisBiz ? (
            <img src="/valisbiz-logo.png" alt="ValisBiz" className="w-36 h-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
          ) : isValisAN ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-blue-700 p-[1.5px]">
                <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-wider text-white">Valis<span className="text-cyan-400 font-extrabold">AN</span></span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-teal-400 via-emerald-400 to-pink-400">
                <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center">
                  <span className="text-lg font-bold text-white">V</span>
                </div>
              </div>
              <span className="text-xl font-black text-white tracking-tight">Valis<span className="text-emerald-400">{isAdmin ? 'Hub' : 'Fin'}</span></span>
            </div>
          )}
        </Link>
        <button 
          className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[45] bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen max-h-screen self-start transition-transform duration-300 ease-in-out z-50 flex flex-col bg-[#090a0f]/95 lg:bg-[#121c27]/5 border-r border-white/10 lg:backdrop-blur-xl shrink-0 justify-between ${sidebarWidth} ${pClass} ${isMobileOpen ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.85)]' : '-translate-x-full lg:translate-x-0'}`}
        data-purpose="desktop-navigation"
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar overflow-x-hidden pr-1">
        <div className={`flex items-center mb-6 px-2 shrink-0 ${isCollapsed ? 'flex-col gap-2 justify-center mt-2' : 'justify-between'}`}>
          {!isCollapsed ? (
            <Link href="/" title="Ir a ValisHub" className="shrink-0 overflow-hidden rounded-xl hover:opacity-90 transition-all cursor-pointer">
              {isValisChat ? (
                <div className="flex items-center gap-3 relative z-10 px-1 py-1 group">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/25 shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-[14px] bg-[#090a0f] flex items-center justify-center">
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-white tracking-tight">Valis<span className="text-emerald-400">Chat</span></span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      WhatsApp Business
                    </p>
                  </div>
                </div>
              ) : isValisBiz ? (
                <img 
                  src="/valisbiz-logo.png" 
                  alt="ValisBiz Logo" 
                  className="w-44 h-auto hover:opacity-90 transition-all object-cover drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                />
              ) : isValisAN ? (
                <div className="flex items-center gap-3 relative z-10 px-1 py-2 group">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/25 p-[2px] transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full bg-[#090a0f] rounded-[14px] flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold tracking-wider text-white">Valis<span className="text-cyan-400 font-extrabold text-shadow-[0_0_12px_rgba(56,189,248,0.6)]">AN</span></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 relative z-10 px-1 py-2 group">
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-teal-400 via-emerald-400 to-pink-400 shadow-[0_0_15px_rgba(45,212,191,0.2)] shrink-0 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center">
                      <span className="text-xl font-bold text-white">V</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {isAdmin ? (
                      <>Valis<span className="text-emerald-400">Hub</span></>
                    ) : (
                      <>Valis<span className="text-emerald-400">Fin</span></>
                    )}
                  </span>
                </div>
              )}
            </Link>
          ) : (
            <Link href="/" title="Ir a ValisHub" className="p-1.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">
              {isValisChat ? (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] flex items-center justify-center shadow-sm">
                  <div className="w-full h-full rounded-[10px] bg-[#090a0f] flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              ) : isValisBiz ? (
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-xs shadow-sm">
                  K
                </div>
              ) : isValisAN ? (
                <div className="w-8 h-8 rounded-xl bg-sky-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-sm">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-teal-400 via-emerald-400 to-pink-400 flex items-center justify-center shadow-sm">
                  <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">V</span>
                  </div>
                </div>
              )}
            </Link>
          )}
          <button 
            onClick={toggleSidebar}
            className={`hidden lg:block text-gray-400 hover:text-white hover:bg-[#121c27]/10 p-1.5 rounded-lg transition-colors ${isCollapsed ? '' : ''}`}
            aria-label="Colapsar menú lateral"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <nav aria-label="Navegación principal" className="space-y-1.5 flex-1">
          {currentNavItems.map((item: any) => {
            const isActive = isValisChat
              ? (item.href === '/whatsapp' ? pathname === '/whatsapp' : pathname.startsWith(item.href))
              : isValisBiz 
                ? item.id === currentTab 
                : (isValisAN ? item.id === valisANCurrentTab : pathname === item.href);
            const Icon = item.icon;
            
            const activeBgClass = isValisChat
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : isValisBiz 
                ? "bg-pink-500/20 text-pink-400 border-pink-500/30" 
                : isValisAN
                  ? "bg-gradient-to-r from-sky-950/90 to-blue-900/40 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(14,165,233,0.15)]"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            
            const inactiveClass = isValisChat
              ? "text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-300 border-transparent hover:border-emerald-500/20"
              : isValisAN 
                ? "text-slate-400 hover:bg-sky-950/40 hover:text-white border-transparent hover:border-sky-500/30"
                : "text-gray-400 hover:bg-white/5 hover:text-white border-transparent";
            
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl font-medium text-sm transition-all group overflow-hidden border ${
                  isActive ? activeBgClass : inactiveClass
                } ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 lg:py-2.5 py-3'}`}
              >
                <Icon className={`shrink-0 w-5 h-5 transition-colors ${isActive ? (isValisChat ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : isValisBiz ? "text-pink-400" : isValisAN ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.7)]" : "text-emerald-400") : (isValisChat ? "text-gray-400 group-hover:text-emerald-300" : isValisAN ? "text-slate-500 group-hover:text-cyan-400" : "text-gray-500 group-hover:text-gray-300")}`} />
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

      <div className={`pt-4 border-t border-white/10 flex flex-col gap-2.5 shrink-0 mt-auto ${isCollapsed ? 'items-center' : ''}`}>

        {isValisBiz && (
          <button
            onClick={() => setIsValisBizOpen(true)}
            title={isCollapsed ? "Configuración ValisBiz" : undefined}
            className="btn3d btn3d-pink btn3d-md w-full flex justify-center bg-pink-50 hover:bg-pink-100 border-pink-200"
          >
            <div className="btn3d-outer w-full">
              <div className="btn3d-inner w-full bg-pink-600 border-b-pink-800">
                <span className="btn3d-label justify-center text-white">
                  <Sparkles className="shrink-0 w-4 h-4 text-pink-100" />
                  {!isCollapsed && <span>Configuración ValisBiz</span>}
                </span>
              </div>
            </div>
          </button>
        )}

        <Link
          href="/"
          title={isCollapsed ? "Panel de Apps" : undefined}
          className={`group relative flex items-center justify-center gap-2 w-full ${isCollapsed ? 'p-2' : 'px-4 py-2.5'} rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-800/10 hover:from-indigo-500/20 hover:to-indigo-500/5 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <Orbit className={`shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} text-indigo-400 group-hover:text-indigo-300 transition-colors relative z-10`} />
          {!isCollapsed && <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors relative z-10">Panel de Apps</span>}
        </Link>

        {profile?.role === 'administrador' && !isAdmin && (
          <Link
            href="/admin"
            title={isCollapsed ? "Panel de Administrador" : undefined}
            className={`group relative flex items-center justify-center gap-2 w-full ${isCollapsed ? 'p-2' : 'px-4 py-2.5'} rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-800/10 hover:from-amber-500/20 hover:to-amber-500/5 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 shadow-sm hover:shadow-amber-500/10 overflow-hidden mt-1`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Shield className={`shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} text-amber-500 group-hover:text-amber-400 transition-colors relative z-10`} />
            {!isCollapsed && <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors relative z-10">Admin Panel</span>}
          </Link>
        )}

        <div className={`flex items-center rounded-xl bg-[#121c27]/5 border border-white/10 ${isCollapsed ? 'p-1.5 justify-center' : 'gap-3 px-2 py-2'}`} title={isCollapsed ? fullName : undefined}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-9 h-9 rounded-full border border-white/20 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-300 text-xs shrink-0">
              {initial}
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {fullName}
              </p>
              <p className="text-[11px] text-gray-400 truncate">Hogar Protegido</p>
            </div>
          )}
        </div>
        <LogoutButton isCollapsed={isCollapsed} />
      </div>
    </aside>

    {isValisBizOpen && (
      <ValisBizSettingsModal isOpen={isValisBizOpen} onClose={() => setIsValisBizOpen(false)} />
    )}
  </>
  );
}
