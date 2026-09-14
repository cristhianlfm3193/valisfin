import Link from 'next/link';
import { 
  Wallet, 
  Home, 
  ArrowRight, 
  Store, 
  LineChart, 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  Smartphone, 
  RefreshCw,
  LogOut,
  Orbit
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PortalButton } from '@/app/components/PortalButton';

export const metadata = {
  title: 'Selección de Portal - Valis Hub',
};

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  const { data: profile } = await supabase.from('profiles').select('app_access').eq('id', user?.id).single();
  const appAccess = profile?.app_access || ['valisfin', 'valisbiz', 'valisan'];

  return (
    <div className="min-h-screen flex flex-col justify-between relative selection:bg-emerald-500 selection:text-white bg-[#090a0f] text-white overflow-x-hidden font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes introFadeUp {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
    
        .animate-intro {
          animation: introFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    
        .portal-card {
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .portal-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.03));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .portal-card:hover {
          transform: translateY(-6px) scale(1.015);
        }
        
        .valisbiz-pill-btn {
          background: linear-gradient(180deg, #ff4099 0%, #e81d77 50%, #c90a5d 100%);
          box-shadow: 0 4px 15px rgba(233, 30, 119, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.55), inset 0 -2px 3px rgba(0, 0, 0, 0.25);
          border-radius: 9999px;
          transition: all 0.25s ease;
        }
        .valisbiz-pill-btn:hover {
          box-shadow: 0 8px 24px rgba(233, 30, 119, 0.65), inset 0 2px 3px rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.25);
          transform: scale(1.02);
        }
        
        .valisfin-pill-btn {
          background: linear-gradient(180deg, #10b981 0%, #059669 50%, #047857 100%);
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.55), inset 0 -2px 3px rgba(0, 0, 0, 0.25);
          border-radius: 9999px;
          transition: all 0.25s ease;
        }
        .valisfin-pill-btn:hover {
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.65), inset 0 2px 3px rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.25);
          transform: scale(1.02);
        }
    
        .valisan-pill-btn {
          background: linear-gradient(180deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%);
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.55), inset 0 -2px 3px rgba(0, 0, 0, 0.25);
          border-radius: 9999px;
          transition: all 0.25s ease;
        }
        .valisan-pill-btn:hover {
          box-shadow: 0 8px 24px rgba(2, 132, 199, 0.65), inset 0 2px 3px rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.25);
          transform: scale(1.02);
        }
      `}} />

      {/* Background Orbs */}
      <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-pink-500/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-inner relative z-10">
              <span className="text-white font-bold text-xs">V</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-white">Valis<span className="text-emerald-400">Hub</span></span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#121c27]/10 text-gray-300 font-medium border border-white/10">v2.5 Multiapp</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#121c27]/5 hover:bg-[#121c27]/10 transition-colors border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-[11px] font-bold text-white shadow-inner overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-xs font-semibold text-gray-200">{fullName}</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Sesión iniciada
            </span>
          </div>
          <form action="/auth/signout" method="post">
            <button title="Cerrar Sesión" className="text-gray-400 hover:text-rose-400 transition-colors ml-1 mt-1">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-8 md:py-12 max-w-6xl mx-auto w-full animate-intro">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
            Portal <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-pink-400 bg-clip-text text-transparent">App Webs</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto">
          
          {/* ValisFin */}
          <PortalButton 
            href="/valisfin"
            hasAccess={appAccess.includes('valisfin')}
            title={<>Valis<span className="text-emerald-400">Fin</span></>}
            icon={<Home className="w-10 h-10 sm:w-12 sm:h-12" />}
            colorClass="bg-emerald-500/5 border-emerald-500/40 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/60 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          />

          {/* ValisBiz */}
          <PortalButton 
            href="/valisbiz"
            hasAccess={appAccess.includes('valisbiz')}
            title={<>Valis<span className="text-pink-400">Biz</span></>}
            icon={<Store className="w-10 h-10 sm:w-12 sm:h-12" />}
            colorClass="bg-pink-500/5 border-pink-500/40 text-pink-400 group-hover:bg-pink-500/20 group-hover:border-pink-400/60 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]"
          />

          {/* ValisAN */}
          <PortalButton 
            href="/valisan"
            hasAccess={appAccess.includes('valisan')}
            title={<>Valis<span className="text-sky-400">AN</span></>}
            icon={<BarChart3 className="w-10 h-10 sm:w-12 sm:h-12" />}
            colorClass="bg-sky-500/5 border-sky-500/40 text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-400/60 group-hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]"
          />

        </div>

        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Conexión segura Supabase Auth</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-pink-400" />
            <span>Optimizado para iPhone 15, Samsung S24 y Desktop</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-sky-400" />
            <span>Cambio de entorno disponible en cualquier momento</span>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-4 px-6 text-center text-gray-500 text-[11px] border-t border-white/5 backdrop-blur-md bg-black/30">
        Valis Ecosistema Unificado • Cristhian Fuentes & Jennifer Camaño • Todos los derechos reservados © 2026
      </footer>
    </div>
  );
}
