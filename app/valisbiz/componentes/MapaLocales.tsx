import dynamic from 'next/dynamic';
import type { Local, VisitaMensual, Vendedor } from '@/types/valisbiz';

const MapaLocalesClient = dynamic(() => import('./MapaLocalesClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#006948] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[#3d4a42] font-semibold text-sm">Cargando inteligencia de campo...</span>
      </div>
    </div>
  )
});

interface MapaLocalesProps {
  locales: Local[];
  visitas: VisitaMensual[];
  vendedores: Vendedor[];
}

export default function MapaLocales({ locales, visitas, vendedores }: MapaLocalesProps) {
  return <MapaLocalesClient locales={locales} visitas={visitas} vendedores={vendedores} />;
}
