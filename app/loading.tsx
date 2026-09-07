import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-full min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-slate-50/50">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100/60 flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-100 rounded-full animate-ping opacity-75"></div>
          <div className="bg-brand-50 p-3 rounded-2xl relative z-10 border border-brand-100/50">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
        </div>
        <div className="flex flex-col items-center mt-2">
          <p className="text-sm font-extrabold text-slate-700 tracking-tight">Sincronizando</p>
          <p className="text-xs font-semibold text-slate-400 mt-0.5 animate-pulse">Obteniendo la información más reciente...</p>
        </div>
      </div>
    </div>
  );
}
