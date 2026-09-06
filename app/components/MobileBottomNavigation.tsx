import Link from "next/link";
import { Home, TrendingUp, CreditCard, Wallet, Target } from "lucide-react";

export function MobileBottomNavigation() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 flex justify-around items-center safe-area-bottom shadow-lg"
      data-purpose="mobile-bottom-bar"
    >
      <Link
        href="#inicio"
        className="flex flex-col items-center gap-1 text-emerald-800 font-bold text-[10px] py-1 min-w-[56px]"
      >
        <Home className="w-5 h-5 text-emerald-700" />
        <span>Inicio</span>
      </Link>
      <Link
        href="#ingresos"
        className="flex flex-col items-center gap-1 text-slate-500 font-medium text-[10px] py-1 min-w-[56px] hover:text-emerald-700"
      >
        <TrendingUp className="w-5 h-5" />
        <span>Ingresos</span>
      </Link>
      <Link
        href="#pagos"
        className="flex flex-col items-center gap-1 text-slate-500 font-medium text-[10px] py-1 min-w-[56px] hover:text-emerald-700"
      >
        <CreditCard className="w-5 h-5" />
        <span>Pagos</span>
      </Link>
      <Link
        href="#gastos"
        className="flex flex-col items-center gap-1 text-slate-500 font-medium text-[10px] py-1 min-w-[56px] hover:text-emerald-700"
      >
        <Wallet className="w-5 h-5" />
        <span>Gastos</span>
      </Link>
      <Link
        href="#metas"
        className="flex flex-col items-center gap-1 text-slate-500 font-medium text-[10px] py-1 min-w-[56px] hover:text-emerald-700"
      >
        <Target className="w-5 h-5" />
        <span>Metas</span>
      </Link>
    </nav>
  );
}
