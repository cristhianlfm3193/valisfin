'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  TrendingUp, 
  Key, 
  BarChart2, 
  LayoutDashboard, 
  Shield, 
  LogOut, 
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function ValisVenSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const navItems = [
    { name: 'Inicio', path: '/valisven', icon: <Home className="w-[20px] h-[20px]" /> },
    { name: 'Ventas', path: '/valisven/ventas', icon: <TrendingUp className="w-[20px] h-[20px]" /> },
    { name: 'Licencias Activas', path: '/valisven/licencias-activas', icon: <Key className="w-[20px] h-[20px]" /> },
    { name: 'Estadísticas', path: '/valisven/estadisticas', icon: <BarChart2 className="w-[20px] h-[20px]" /> },
  ];

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.first_name || 'Usuario ValisVen';
  const initial = fullName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/valisven') {
      return pathname === '/valisven';
    }
    return pathname?.startsWith(path);
  };

  const effectivelyCollapsed = isCollapsed && !isOpen;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-[60] p-2 bg-slate-900 rounded-lg text-amber-400 border border-amber-500/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col justify-between bg-slate-950/70 lg:bg-slate-950/40 backdrop-blur-2xl border-r border-amber-500/20 transition-all duration-300 ${effectivelyCollapsed ? 'w-20' : 'w-72'} ${isOpen ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.85)]' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className={`h-20 px-6 flex items-center ${effectivelyCollapsed ? 'justify-center px-0' : 'justify-between'} border-b border-amber-500/10 shrink-0`}>
            {!effectivelyCollapsed ? (
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-[1.5px] shadow-[0_0_18px_rgba(245,158,11,0.45)]">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <span className="text-xl font-extrabold text-amber-400 font-sans">V</span>
                  </div>
                </div>
                <div className="flex items-baseline tracking-tight">
                  <span className="text-xl font-bold text-white">Valis</span>
                  <span className="text-xl font-bold text-amber-400 ml-1">Ven</span>
                </div>
              </Link>
            ) : (
              <Link href="/" className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-[1.5px] hover:opacity-80 transition-opacity">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-amber-400 font-sans">V</span>
                </div>
              </Link>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden lg:block text-amber-500/70 hover:text-amber-400 p-1.5 rounded-lg transition-colors`}
            >
              {effectivelyCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          {!effectivelyCollapsed && (
            <div className="px-4 pt-6 pb-2">
              <span className="text-xs uppercase tracking-widest text-amber-500/70 px-2 font-semibold">Navegación Principal</span>
            </div>
          )}
          
          <nav className={`flex flex-col gap-1 ${effectivelyCollapsed ? 'px-2 pt-6' : 'px-4'}`}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center rounded-xl transition-all group border border-transparent overflow-hidden ${
                    active 
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 font-bold border-l-2 border-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]' 
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900/60'
                  } ${effectivelyCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'}`}
                >
                  <span className={`shrink-0 transition-colors ${active ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`}>
                    {item.icon}
                  </span>
                  {!effectivelyCollapsed && (
                    <span className="text-sm truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`flex flex-col border-t border-amber-500/10 bg-slate-950/40 p-4 gap-3 shrink-0 ${effectivelyCollapsed ? 'items-center px-2' : ''}`}>
          <Link 
            href="/"
            title={effectivelyCollapsed ? "Volver a ValisHub" : undefined}
            className={`group relative flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-800/10 hover:from-indigo-500/20 hover:to-indigo-500/5 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 overflow-hidden ${effectivelyCollapsed ? 'p-2' : 'px-4 py-2.5'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <LayoutDashboard className={`shrink-0 text-indigo-400 group-hover:text-indigo-300 transition-colors relative z-10 ${effectivelyCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            {!effectivelyCollapsed && <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors relative z-10">Volver a ValisHub</span>}
          </Link>
          
          <Link 
            href="/admin"
            title={effectivelyCollapsed ? "Admin Panel" : undefined}
            className={`group relative flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-800/10 hover:from-amber-500/20 hover:to-amber-500/5 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 shadow-sm hover:shadow-amber-500/10 overflow-hidden ${effectivelyCollapsed ? 'p-2' : 'px-4 py-2.5'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Shield className={`shrink-0 text-amber-500 group-hover:text-amber-400 transition-colors relative z-10 ${effectivelyCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            {!effectivelyCollapsed && <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors relative z-10">Admin Panel</span>}
          </Link>

          <div className={`flex items-center rounded-xl bg-slate-900/40 border border-white/5 mt-1 ${effectivelyCollapsed ? 'justify-center p-1.5' : 'gap-3 px-2 py-2'}`} title={effectivelyCollapsed ? fullName : undefined}>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full border border-white/20 shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-xs shrink-0">
                {initial}
              </div>
            )}
            {!effectivelyCollapsed && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{fullName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email ? user.email.split('@')[0] : 'Comandante'}</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSignOut}
            title={effectivelyCollapsed ? "Cerrar Sesión" : undefined}
            className={`flex items-center justify-center gap-2 w-full rounded-xl bg-slate-900/50 hover:bg-red-950/40 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-900/30 transition-all group ${effectivelyCollapsed ? 'p-2' : 'py-2'}`}
          >
            <LogOut className={`shrink-0 group-hover:text-rose-400 transition-colors ${effectivelyCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            {!effectivelyCollapsed && <span className="text-xs font-semibold">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
