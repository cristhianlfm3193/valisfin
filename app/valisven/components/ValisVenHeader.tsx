'use client';

import { Lock, User } from 'lucide-react';

export function ValisVenHeader() {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-slate-950/70 backdrop-blur-2xl border-b border-amber-500/20 z-40 px-6 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3 ml-12 lg:ml-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-[1px] shadow-[0_0_12px_rgba(245,158,11,0.5)]">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
            <span className="text-sm font-extrabold text-amber-400 font-sans">V</span>
          </div>
        </div>
        <div className="flex items-center tracking-tight">
          <span className="font-bold text-white">Valis</span>
          <span className="font-bold text-amber-400">Ven</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Lock className="text-emerald-400 w-4 h-4" />
          <span className="text-xs font-semibold text-emerald-300 tracking-wide">Supabase Encriptado</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center">
          <User className="text-white w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
