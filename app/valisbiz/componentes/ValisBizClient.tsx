'use client';

import Link from 'next/link';
import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, LayoutGrid, MapPin, RefreshCw, Heart, ChevronLeft, ChevronRight, Plus, FileDown, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import MetricasVentas from './MetricasVentas';
import EstadisticasPowerBI from './EstadisticasPowerBI';
import MapaLocales from './MapaLocales';
import ModalRegistrar from './ModalRegistrar';
import ModalReporte from './ModalReporte';
import AccionesRapidasIA from './AccionesRapidasIA';
import LoadingOverlay from './LoadingOverlay';
import { Btn3D } from '@/app/components/Btn3D';
import type { ResumenMensualVendedor, MetaSupervisor } from '@/types/valisbiz';

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface RegistroFila {
  id: string;
  vendedor_nombre: string;
  fecha: string;
  monto: number;
  contado: number;
  credito: number;
  notas?: string | null;
}

interface RegistroVendidoFila {
  id: string;
  vendedor_nombre: string;
  fecha: string;
  monto: number;
  vistas: number;
  con_compra: number;
  sin_compra: number;
  contado: number;
  credito: number;
}

interface ValisBizClientProps {
  initialData: {
    metas: MetaSupervisor;
    vendedores: any[];
    resumenMensual: ResumenMensualVendedor[];
    locales: any[];
    tareas: any[];
    mesPeriodo: number;
    anioPeriodo: number;
    registrosFacturado: RegistroFila[];
    registrosVendido: RegistroVendidoFila[];
    visitas: any[];
  };
  user: { name: string; initial: string };
}

export default function ValisBizClient({ initialData, user }: ValisBizClientProps) {
  const [activeTab, setActiveTab] = useState<'ventas' | 'estadisticas' | 'mapa'>('ventas');
  const [showModal, setShowModal] = useState(false);
  const [showReporte, setShowReporte] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { mesPeriodo, anioPeriodo } = initialData;
  const now = new Date();
  const currentMes = now.getMonth() + 1;
  const currentAnio = now.getFullYear();
  const isMesActual = mesPeriodo === currentMes && anioPeriodo === currentAnio;

  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'ventas' || tabParam === 'estadisticas' || tabParam === 'mapa') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const navigateMes = (direction: 'prev' | 'next') => {
    let newMes = mesPeriodo + (direction === 'next' ? 1 : -1);
    let newAnio = anioPeriodo;
    if (newMes > 12) { newMes = 1; newAnio++; }
    if (newMes < 1) { newMes = 12; newAnio--; }
    const params = new URLSearchParams(searchParams.toString());
    params.set('mes', newMes.toString());
    params.set('anio', newAnio.toString());
    startTransition(() => {
      router.push(`/valisbiz?${params.toString()}`, { scroll: false });
      router.refresh();
    });
  };

  const goToCurrentMonth = () => {
    startTransition(() => {
      router.push('/valisbiz', { scroll: false });
      router.refresh();
    });
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    startTransition(() => { router.refresh(); });
  };

  return (
    <div className="flex flex-col w-full text-slate-200">
      {/* Loading overlay al navegar entre meses */}
      {isPending && <LoadingOverlay />}

      {/* Modal Registrar */}
      {showModal && (
        <ModalRegistrar
          vendedores={initialData.vendedores.map(v => ({ id: v.id, nombre: v.nombre }))}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Modal Reporte PDF */}
      {showReporte && (
        <ModalReporte onClose={() => setShowReporte(false)} />
      )}

      {/* Unified Header */}
      <header className="w-full bg-[#121c27]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto py-3">

          {/* Row 1: Logo + Brand + Button */}
          <div className="flex items-center justify-between gap-3">
            {/* Left: Logo + Brand */}
            <Link href="/" title="Ir a ValisHub" className="flex items-center gap-3 min-w-0 group cursor-pointer hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                <Image src="/keiko-logo.png" alt="Keiko" width={36} height={36} className="w-full h-full object-contain" />
              </div>
              <div className="h-8 w-px bg-pink-200 hidden sm:block flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm sm:text-base font-bold tracking-tight whitespace-nowrap group-hover:text-pink-400 transition-colors">
                    Valis<span className="text-pink-400">Biz</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
                    <Heart className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-pink-500" />
                    <span className="hidden xs:inline">Supervisión</span> Keiko
                  </span>
                </div>
                <h1 className="text-xs sm:text-sm lg:text-base font-bold text-slate-300 leading-tight hidden sm:block truncate max-w-[280px] lg:max-w-none">
                  Panel de Control · Supervisión Panamá Oeste
                </h1>
              </div>
            </Link>

            {/* Right: Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Generar Reporte */}
              <Btn3D
                color="gray"
                size="sm"
                onClick={() => setShowReporte(true)}
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Reporte</span>
              </Btn3D>
              {/* Registrar */}
              <Btn3D
                color="pink"
                size="sm"
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Registrar</span>
              </Btn3D>
            </div>

          </div>

          {/* Row 2 (mobile only): Month Navigator + Title */}
          <div className="flex items-center justify-between gap-3 mt-2 sm:hidden">
            <p className="text-xs font-semibold text-slate-400 truncate">
              Panel · Supervisión Panamá Oeste
            </p>
            {/* Month Navigator compact */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1 py-0.5 flex-shrink-0">
              <button onClick={() => navigateMes('prev')} disabled={isPending} className="p-1 rounded hover:bg-[#121c27] transition-colors disabled:opacity-50">
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <div className="flex flex-col items-center px-1.5">
                <span className="text-[11px] font-bold text-slate-200 whitespace-nowrap leading-tight">
                  {MESES[mesPeriodo].substring(0, 3)} {anioPeriodo}
                </span>
                {!isMesActual ? (
                  <button onClick={goToCurrentMonth} className="text-[9px] text-pink-500 font-semibold leading-none">actual</button>
                ) : (
                  <span className="text-[9px] text-green-600 font-semibold leading-none">● En curso</span>
                )}
              </div>
              <button onClick={() => navigateMes('next')} disabled={isPending} className="p-1 rounded hover:bg-[#121c27] transition-colors disabled:opacity-50">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Row 2 (desktop only): Month Navigator inline */}
          <div className="hidden sm:flex items-center justify-end mt-1.5">
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1 py-1">
              <button onClick={() => navigateMes('prev')} disabled={isPending} className="p-1.5 rounded-lg hover:bg-[#121c27] transition-colors disabled:opacity-50">
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <div className="flex flex-col items-center px-2">
                <span className="text-xs font-bold text-slate-200 whitespace-nowrap">{MESES[mesPeriodo]} {anioPeriodo}</span>
                {!isMesActual ? (
                  <button onClick={goToCurrentMonth} className="text-[10px] text-pink-500 font-semibold hover:underline leading-none">ir al actual</button>
                ) : (
                  <span className="text-[10px] text-green-600 font-semibold leading-none flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />En curso
                  </span>
                )}
              </div>
              <button onClick={() => navigateMes('next')} disabled={isPending} className="p-1.5 rounded-lg hover:bg-[#121c27] transition-colors disabled:opacity-50">
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Viewport Shell */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-28">

        {/* Mes cerrado banner */}
        {!isMesActual && (
          <div className="mb-4 flex items-center gap-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl px-4 py-2.5 text-sm font-medium">
            <span>📅</span>
            Viendo datos históricos de <strong>{MESES[mesPeriodo]} {anioPeriodo}</strong> — Mes cerrado
          </div>
        )}


        {/* Tab Contents */}
        {activeTab === 'ventas' && (
          <MetricasVentas
            metas={initialData.metas}
            resumenMensual={initialData.resumenMensual}
            mesPeriodo={mesPeriodo}
            anioPeriodo={anioPeriodo}
            isMesCerrado={!isMesActual}
            registrosFacturado={initialData.registrosFacturado}
            registrosVendido={initialData.registrosVendido}
          />
        )}
        {activeTab === 'estadisticas' && (
          <EstadisticasPowerBI 
            registrosFacturado={initialData.registrosFacturado}
            registrosVendido={initialData.registrosVendido}
            metas={initialData.metas}
            resumenMensual={initialData.resumenMensual}
          />
        )}
        {activeTab === 'mapa' && (
          <MapaLocales 
            locales={initialData.locales} 
            visitas={initialData.visitas || []}
            vendedores={initialData.vendedores || []}
          />
        )}
      </div>

      {/* Widget IA flotante — siempre visible en ValisBiz */}
      <AccionesRapidasIA
        vendedores={initialData.vendedores.map(v => ({ id: v.id, nombre: v.nombre }))}
        onSuccess={() => startTransition(() => { router.refresh(); })}
      />
    </div>
  );
}
