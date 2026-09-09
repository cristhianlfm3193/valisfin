'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, LayoutGrid, MapPin, RefreshCw, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import MetricasVentas from './MetricasVentas';
import KanbanBoard from './KanbanBoard';
import MapaLocales from './MapaLocales';
import type { ResumenMensualVendedor, MetaSupervisor } from '@/types/valisbiz';

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface ValisBizClientProps {
  initialData: {
    metas: MetaSupervisor;
    vendedores: any[];
    resumenMensual: ResumenMensualVendedor[];
    locales: any[];
    tareas: any[];
    mesPeriodo: number;
    anioPeriodo: number;
  };
  user: { name: string; initial: string };
}

export default function ValisBizClient({ initialData, user }: ValisBizClientProps) {
  const [activeTab, setActiveTab] = useState<'ventas' | 'tareas' | 'mapa'>('ventas');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { mesPeriodo, anioPeriodo } = initialData;
  const now = new Date();
  const currentMes = now.getMonth() + 1;
  const currentAnio = now.getFullYear();
  const isMesActual = mesPeriodo === currentMes && anioPeriodo === currentAnio;

  const navigateMes = (direction: 'prev' | 'next') => {
    let newMes = mesPeriodo + (direction === 'next' ? 1 : -1);
    let newAnio = anioPeriodo;
    if (newMes > 12) { newMes = 1; newAnio++; }
    if (newMes < 1) { newMes = 12; newAnio--; }
    startTransition(() => {
      router.push(`/valisbiz?mes=${newMes}&anio=${newAnio}`);
    });
  };

  const goToCurrentMonth = () => {
    startTransition(() => {
      router.push('/valisbiz');
    });
  };

  return (
    <div className="flex flex-col w-full text-[#131b2e]">
      {/* Unified Header */}
      <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 py-3">
          {/* Left: Logo + Brand + Title */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0">
              <Image src="/keiko-logo.png" alt="Keiko" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <div className="h-9 w-px bg-pink-200 hidden sm:block flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold tracking-tight whitespace-nowrap">
                  Valis<span className="text-pink-600">Biz</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
                  <Heart className="w-2.5 h-2.5 fill-pink-500" />
                  Supervisión Keiko
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight truncate">
                Panel de Control <span className="text-pink-500">·</span> Supervisión Panamá Oeste
              </h1>
            </div>
          </div>

          {/* Right: Month selector + Action */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Month Navigator */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-1 py-1">
              <button
                onClick={() => navigateMes('prev')}
                disabled={isPending}
                className="p-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <div className="flex flex-col items-center px-2">
                <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                  {MESES[mesPeriodo]} {anioPeriodo}
                </span>
                {!isMesActual && (
                  <button
                    onClick={goToCurrentMonth}
                    className="text-[10px] text-pink-500 font-semibold hover:underline leading-none"
                  >
                    ir al actual
                  </button>
                )}
                {isMesActual && (
                  <span className="text-[10px] text-green-600 font-semibold leading-none flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                    En curso
                  </span>
                )}
              </div>
              <button
                onClick={() => navigateMes('next')}
                disabled={isPending || isMesActual}
                className="p-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Register Venta button */}
            <button className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold shadow-md transition-all whitespace-nowrap">
              + Registrar Venta
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport Shell */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-28">

        {/* Mes cerrado banner */}
        {!isMesActual && (
          <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-sm font-medium">
            <span className="text-base">📅</span>
            Viendo datos históricos de <strong>{MESES[mesPeriodo]} {anioPeriodo}</strong> — Mes cerrado
          </div>
        )}

        {/* Tab Switcher */}
        <div className="bg-[#f2f3ff] p-1.5 rounded-2xl mb-6 flex items-center justify-between gap-2 shadow-inner overflow-x-auto">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ventas')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'ventas' ? 'bg-white text-pink-600 shadow-sm' : 'text-[#3d4a42] hover:text-[#131b2e]'}`}
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Ventas & Métricas</span>
            </button>
            <button
              onClick={() => setActiveTab('tareas')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'tareas' ? 'bg-white text-pink-600 shadow-sm' : 'text-[#3d4a42] hover:text-[#131b2e]'}`}
            >
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Tareas & Cronograma</span>
            </button>
            <button
              onClick={() => setActiveTab('mapa')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'mapa' ? 'bg-white text-pink-600 shadow-sm' : 'text-[#3d4a42] hover:text-[#131b2e]'}`}
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Mapa & Locales BI</span>
            </button>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[#3d4a42] font-mono text-xs pr-3 whitespace-nowrap">
            <RefreshCw className={`w-4 h-4 text-pink-500 ${isPending ? 'animate-spin' : ''}`} />
            <span>{isPending ? 'Cargando...' : 'Sincronizado'}</span>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'ventas' && (
          <MetricasVentas
            metas={initialData.metas}
            resumenMensual={initialData.resumenMensual}
            mesPeriodo={mesPeriodo}
            anioPeriodo={anioPeriodo}
            isMesCerrado={!isMesActual}
          />
        )}
        {activeTab === 'tareas' && (
          <KanbanBoard initialTareas={initialData.tareas} />
        )}
        {activeTab === 'mapa' && (
          <MapaLocales locales={initialData.locales} />
        )}
      </div>
    </div>
  );
}
