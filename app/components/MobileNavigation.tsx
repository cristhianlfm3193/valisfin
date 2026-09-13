'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Home, 
  TrendingUp, 
  Wallet, 
  Menu,
  X,
  CreditCard, 
  Car, 
  Wrench, 
  Target, 
  Calendar, 
  BarChart2, 
  Shield,
  MapPin,
  Heart,
  Orbit,
  Sparkles
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import type { User } from '@supabase/supabase-js';
import { ValisBizSettingsModal } from '@/app/admin/components/ValisBizSettingsModal';

const allNavItems = [
  { href: "/valisfin", label: "Inicio", icon: Home },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/pagos-fijos", label: "Pagos Fijos", icon: CreditCard },
  { href: "/gastos-diarios", label: "Gastos Diarios", icon: Wallet },
  { href: "/vehiculos", label: "Vehículos", icon: Car },
  { href: "/hogar", label: "Hogar", icon: Wrench },
  { href: "/metas", label: "Metas de Ahorro", icon: Target },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/consultas", label: "Consultas", icon: BarChart2 },
];

export function MobileNavigation({ user, profile }: { user?: User, profile?: any }) {
  return (
    <Suspense fallback={<div className="fixed bottom-4 left-4 right-4 h-16 bg-white/95 backdrop-blur-md border border-slate-200 rounded-[2rem] lg:hidden z-40 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" />}>
      <MobileNavigationInner user={user} profile={profile} />
    </Suspense>
  );
}

function MobileNavigationInner({ user, profile }: { user?: User, profile?: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isValisBizOpen, setIsValisBizOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();



  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const isValisBiz = pathname.startsWith('/valisbiz');
  const isValisAN = pathname.startsWith('/valisan');
  const currentTab = searchParams.get('tab') || 'ventas';
  const valisANCurrentTab = searchParams.get('tab') || 'dashboard';

  const valisFinBottomItems = [
    { href: "/valisfin", label: "Inicio", icon: Home },
    { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
    { href: "/pagos-fijos", label: "P. Fijos", icon: CreditCard },
    { href: "/gastos-diarios", label: "G. Diarios", icon: Wallet },
  ];

  const valisBizNavItems = [
    { href: "/valisbiz?tab=ventas", label: "Métricas", icon: TrendingUp, id: 'ventas' },
    { href: "/valisbiz?tab=estadisticas", label: "Datos", icon: BarChart2, id: 'estadisticas' },
    { href: "/valisbiz?tab=mapa", label: "Visitas", icon: MapPin, id: 'mapa' },
  ];

  const valisANNavItems = [
    { href: "/valisan?tab=dashboard", label: "Dash", icon: BarChart2, id: 'dashboard' },
    { href: "/valisan?tab=aipp", label: "AIPP", icon: Target, id: 'aipp' },
    { href: "/valisan?tab=bdrh", label: "BD-RH", icon: Shield, id: 'bdrh' },
  ];

  const currentBottomItems = isValisBiz ? valisBizNavItems : (isValisAN ? valisANNavItems : valisFinBottomItems);
  const currentAllNavItems = isValisBiz ? valisBizNavItems : (isValisAN ? valisANNavItems : allNavItems);

  if (pathname === '/') {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation Bar (Floating Bubble) */}
      <div className="fixed bottom-4 left-4 right-4 bg-[#090a0f]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] lg:hidden z-40 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {currentBottomItems.map((item: any) => {
            const isActive = isValisBiz ? item.id === currentTab : (isValisAN ? item.id === valisANCurrentTab : pathname === item.href);
            const Icon = item.icon;
            
            const activeClass = isValisBiz 
              ? 'bg-pink-500/20 text-pink-400 scale-105' 
              : isValisAN 
                ? 'bg-sky-950 text-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.3)] scale-105' 
                : 'bg-white/10 text-white scale-105';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-3xl min-w-[72px] transition-all duration-300 ${isActive ? activeClass : 'text-gray-400 hover:text-white'}`}
              >
                <Icon className={`w-6 h-6 mb-1 transition-all ${isActive ? (isValisBiz ? 'fill-pink-500/20 text-pink-400' : isValisAN ? 'fill-sky-500/20 text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.7)]' : 'fill-white/20 text-white') : ''}`} />
                <span className={`text-[10px] font-bold transition-all ${isActive ? (isValisBiz ? 'text-pink-400' : isValisAN ? 'text-cyan-400' : 'text-white') : 'text-gray-400'}`}>{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-3xl min-w-[72px] transition-all duration-300 ${isMenuOpen ? 'bg-white/10 text-white scale-105' : 'text-gray-400 hover:text-white'}`}
          >
            <Menu className="w-6 h-6 mb-1 transition-all" />
            <span className={`text-[10px] font-bold transition-all ${isMenuOpen ? 'text-white' : 'text-gray-400'}`}>Menú</span>
          </button>
        </div>
      </div>

      {/* Full Screen Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden flex flex-col justify-end transition-opacity">
          <div className="absolute inset-0" onClick={() => setIsMenuOpen(false)}></div>
          <div className="bg-[#090a0f]/95 border-t border-white/10 backdrop-blur-2xl w-full rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-extrabold text-white">Menú Principal</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {currentAllNavItems.map((item: any) => {
                  const isActive = isValisBiz ? item.id === currentTab : pathname === item.href;
                  const Icon = item.icon;
                  
                  const activeClass = isValisBiz 
                    ? 'bg-pink-500/20 border-pink-500/30 text-pink-400' 
                    : isValisAN
                      ? 'bg-sky-950 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                      : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
                    
                  const inactiveClass = isValisAN 
                    ? 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10';
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all ${isActive ? activeClass : inactiveClass}`}
                    >
                      <Icon className={`w-7 h-7 ${isActive ? (isValisBiz ? 'text-pink-400' : isValisAN ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.7)]' : 'text-emerald-400') : 'text-gray-500'}`} />
                      <span className="text-xs font-bold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3.5 w-full pt-5 border-t border-white/10">

                {isValisBiz && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsValisBizOpen(true);
                    }}
                    className="btn3d btn3d-pink btn3d-lg w-full flex justify-center bg-pink-50 hover:bg-pink-100 border-pink-200"
                  >
                    <div className="btn3d-outer w-full flex justify-center">
                      <div className="btn3d-inner w-full flex justify-center py-3 bg-pink-600 border-b-pink-800">
                        <span className="btn3d-label justify-center text-sm font-bold gap-2 text-white">
                          <Sparkles className="w-4 h-4 text-pink-100" />
                          <span>Configuración ValisBiz</span>
                        </span>
                      </div>
                    </div>
                  </button>
                )}

                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn3d btn3d-gray btn3d-lg w-full flex justify-center bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                >
                  <div className="btn3d-outer w-full flex justify-center">
                    <div className="btn3d-inner w-full flex justify-center py-3 bg-indigo-600 border-b-indigo-800">
                      <span className="btn3d-label justify-center text-sm font-bold gap-2 text-white">
                        <Orbit className="w-4 h-4 text-indigo-100" />
                        <span>Panel de Apps</span>
                      </span>
                    </div>
                  </div>
                </Link>

                {profile?.role === 'administrador' && (
                  <Link
                    href={pathname === '/admin' ? '/valisfin' : '/admin'}
                    onClick={() => setIsMenuOpen(false)}
                    className={`btn3d ${pathname === '/admin' ? 'btn3d-emerald' : 'btn3d-gray'} btn3d-lg w-full flex justify-center`}
                  >
                    <div className="btn3d-outer w-full flex justify-center">
                      <div className="btn3d-inner w-full flex justify-center py-3">
                        <span className="btn3d-label justify-center text-sm font-bold gap-2">
                          <Shield className="w-4 h-4 text-amber-500" />
                          <span>{pathname === '/admin' ? 'Salir del Panel Admin' : 'Panel de Administrador'}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
                
                <div className="flex items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3 min-w-0">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="User" className="w-10 h-10 rounded-full border border-white/20 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        {(user?.user_metadata?.full_name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || "Usuario"}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div onClick={() => setIsMenuOpen(false)} className="shrink-0">
                    <LogoutButton isCollapsed={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isValisBizOpen && (
        <ValisBizSettingsModal isOpen={isValisBizOpen} onClose={() => setIsValisBizOpen(false)} />
      )}
    </>
  );
}
