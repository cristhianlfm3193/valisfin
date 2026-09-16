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
          <div className="flex flex-col gap-1">
            <Link 
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-900/70 transition-all group"
            >
              <LayoutDashboard className="w-[19px] h-[19px] text-amber-400/80 group-hover:text-amber-300" />
              <span className="text-sm font-semibold">Volver a ValisHub</span>
            </Link>
            <Link 
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-900/70 transition-all group"
            >
              <Shield className="w-[19px] h-[19px] text-amber-400 group-hover:text-amber-300" />
              <span className="text-sm font-semibold">Admin Panel</span>
            </Link>
          </div>
          
          <div className="my-1 h-px bg-slate-800/80"></div>
          
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-amber-500/15">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 p-[1px] shadow-sm">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <span className="font-mono text-amber-300 font-bold text-xs">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      initial
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight max-w-[100px] truncate">{fullName}</span>
                <span className="text-xs text-amber-400/80 leading-none mt-0.5">{user?.email ? user.email.split('@')[0] : 'Comandante'}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-950/20 hover:bg-red-900/40 text-rose-300 hover:text-rose-100 border border-rose-900/30 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="text-xs font-semibold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
