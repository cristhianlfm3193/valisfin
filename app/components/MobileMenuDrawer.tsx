'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Car, 
  Target, 
  BarChart2 
} from 'lucide-react';
import { LogoutButtonMobile } from './LogoutButton';

interface MobileMenuDrawerProps {
  avatarUrl?: string | null;
  fullName: string;
  initial: string;
}

export function MobileMenuDrawer({ avatarUrl, fullName, initial }: MobileMenuDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const drawerContent = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden transition-opacity"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* User Info Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center font-bold text-emerald-800 text-sm">
                {initial}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {fullName}
              </p>
              <p className="text-[11px] text-emerald-300 truncate">Portal Familiar</p>
            </div>
          </div>
          <button 
            onClick={closeMenu}
            className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5 custom-scrollbar">
          {[
            { href: "/", label: "Inicio", icon: Home },
            { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
            { href: "/pagos-fijos", label: "Pagos Fijos", icon: CreditCard },
            { href: "/gastos-diarios", label: "Gastos Diarios", icon: Wallet },
            { href: "/vehiculos", label: "Vehículos", icon: Car },
            { href: "#metas", label: "Metas de Ahorro", icon: Target },
            { href: "#consultas", label: "Consultas & Reportes", icon: BarChart2 },
          ].map((item) => {
            const isActive = usePathname() === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition group ${
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Opciones</span>
          <LogoutButtonMobile />
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
        aria-label="Abrir menú principal"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mounted && typeof document !== 'undefined' 
        ? require('react-dom').createPortal(drawerContent, document.body) 
        : null}
    </>
  );
}
