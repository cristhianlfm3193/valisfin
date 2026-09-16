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
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function ValisVenSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
      <aside className={`fixed left-0 top-0 h-screen w-72 z-50 flex flex-col justify-between bg-slate-950/70 backdrop-blur-2xl border-r border-amber-500/20 shadow-[0_0_40px_rgba(0,0,0,0.85)] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col">
          <div className="h-20 px-6 flex items-center justify-between border-b border-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-[1.5px] shadow-[0_0_18px_rgba(245,158,11,0.45)]">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-amber-400 font-sans">V</span>
                </div>
              </div>
              <div className="flex items-baseline tracking-tight">
                <span className="text-xl font-bold text-white">Valis</span>
                <span className="text-xl font-bold text-amber-400 ml-1">Ven</span>
              </div>
            </div>
          </div>

          <div className="px-4 pt-6 pb-2">
            <span className="text-xs uppercase tracking-widest text-amber-500/70 px-2 font-semibold">Navegación Principal</span>
          </div>
          
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                    active 
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 font-bold border-l-2 border-amber-400 shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]' 
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900/60'
                  }`}
                >
                  <span className={active ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400 transition-colors'}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col border-t border-amber-500/10 bg-slate-950/40 p-4 gap-3">
          <Link 
            href="/"
            className="group relative flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-800/10 hover:from-indigo-500/20 hover:to-indigo-500/5 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <LayoutDashboard className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors relative z-10" />
            <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors relative z-10">Volver a ValisHub</span>
          </Link>
          
          <Link 
            href="/admin"
            className="group relative flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-800/10 hover:from-amber-500/20 hover:to-amber-500/5 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 shadow-sm hover:shadow-amber-500/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Shield className="w-4 h-4 text-amber-500 group-hover:text-amber-400 transition-colors relative z-10" />
            <span className="font-semibold text-sm text-slate-300 group-hover:text-white transition-colors relative z-10">Admin Panel</span>
          </Link>

          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-900/40 border border-white/5 mt-1">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full border border-white/20 shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-xs shrink-0">
                {initial}
              </div>
            )}
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{fullName}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email ? user.email.split('@')[0] : 'Comandante'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-900/50 hover:bg-red-950/40 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-900/30 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:text-rose-400 transition-colors" />
            <span className="text-xs font-semibold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
