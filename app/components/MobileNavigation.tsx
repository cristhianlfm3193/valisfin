'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Heart
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import type { User } from '@supabase/supabase-js';

const allNavItems = [
  { href: "/", label: "Inicio", icon: Home },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

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

  const bottomNavItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/pagos-fijos", label: "Pagos Fijos", icon: CreditCard },
    { href: "/gastos-diarios", label: "Gastos", icon: Wallet },
  ];

  return (
    <>
      {/* Bottom Navigation Bar (Floating Bubble) */}
      <div className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-[2rem] lg:hidden z-40 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-3xl min-w-[72px] transition-all duration-300 ${isActive ? 'bg-slate-100 text-slate-900 scale-105' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Icon className={`w-6 h-6 mb-1 transition-all ${isActive ? 'fill-slate-800 text-slate-800' : ''}`} />
                <span className={`text-[10px] font-bold transition-all ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-3xl min-w-[72px] transition-all duration-300 ${isMenuOpen ? 'bg-slate-100 text-slate-900 scale-105' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Menu className="w-6 h-6 mb-1 transition-all" />
            <span className={`text-[10px] font-bold transition-all ${isMenuOpen ? 'text-slate-900' : 'text-slate-500'}`}>Menú</span>
          </button>
        </div>
      </div>

      {/* Full Screen Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden flex flex-col justify-end transition-opacity">
          <div className="absolute inset-0" onClick={() => setIsMenuOpen(false)}></div>
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 relative z-10 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-extrabold text-slate-800">Menú Principal</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {allNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex flex-col items-center text-center gap-2 p-4 rounded-2xl border transition-all ${isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm' : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200'}`}
                    >
                      <Icon className={`w-7 h-7 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3.5 w-full pt-5 border-t border-slate-100">
                <Link
                  href="/valisbiz"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn3d btn3d-pink btn3d-lg w-full flex justify-center"
                >
                  <div className="btn3d-outer w-full flex justify-center">
                    <div className="btn3d-inner w-full flex justify-center py-3">
                      <span className="btn3d-label justify-center text-sm font-bold gap-2">
                        <Heart className="w-4 h-4 text-pink-100 fill-pink-100" />
                        <span>ValisBiz Supervisión</span>
                      </span>
                    </div>
                  </div>
                </Link>

                {profile?.role === 'administrador' && (
                  <Link
                    href={pathname === '/admin' ? '/' : '/admin'}
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
                
                <div className="flex items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-3 min-w-0">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="User" className="w-10 h-10 rounded-full border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                        {(user?.user_metadata?.full_name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.user_metadata?.full_name || "Usuario"}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
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
    </>
  );
}
