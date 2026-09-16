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
      <header className="w-full bg-[#121c27]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-8 shadow-sm border-b border-pink-100/10">
        <div className="max-w-7xl mx-auto py-2.5 flex items-center justify-between gap-2">

          {/* Month Navigator inline */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1 py-1 flex-1 sm:flex-none justify-between sm:justify-start">
            <button onClick={() => navigateMes('prev')} disabled={isPending} className="p-1.5 sm:p-2 rounded-lg hover:bg-[#121c27] transition-colors disabled:opacity-50">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </button>
            <div className="flex flex-col items-center px-2 sm:px-4">
              <span className="text-[13px] sm:text-sm font-bold text-slate-200 whitespace-nowrap">{MESES[mesPeriodo]} {anioPeriodo}</span>
              {!isMesActual ? (
                <button onClick={goToCurrentMonth} className="text-[10px] text-pink-500 font-semibold hover:underline leading-none mt-0.5">ir al actual</button>
              ) : (
                <span className="text-[10px] text-green-600 font-semibold leading-none flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />En curso
                </span>
              )}
            </div>
            <button onClick={() => navigateMes('next')} disabled={isPending} className="p-1.5 sm:p-2 rounded-lg hover:bg-[#121c27] transition-colors disabled:opacity-50">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </button>
          </div>

          {/* Buttons */}
          {activeTab === 'ventas' && (
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
          )}
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
