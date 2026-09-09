'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, TrendingUp, View, MapPin, RefreshCw, LayoutDashboard } from 'lucide-react';
import MetricasVentas from './MetricasVentas';
import KanbanBoard from './KanbanBoard';
import MapaLocales from './MapaLocales';

interface ValisBizClientProps {
  initialData: {
    metas: any;
    vendedores: any[];
    locales: any[];
    tareas: any[];
  };
  user: {
    name: string;
    initial: string;
  };
}

export default function ValisBizClient({ initialData, user }: ValisBizClientProps) {
  const [activeTab, setActiveTab] = useState<'ventas' | 'tareas' | 'mapa'>('ventas');

  return (
    <div className="flex flex-col w-full text-[#131b2e]">
      {/* Top Corporate Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">Valis<span className="text-[#006948]">Biz</span></span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#adedd3] text-[#306d58] text-[10px] font-semibold uppercase tracking-wider">
                  Supervisión Keiko
                </span>
              </div>
              <span className="text-xs text-[#3d4a42] hidden sm:inline">Panel Operativo & Inteligencia de Campo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-[#f2f3ff] px-3 py-1.5 rounded-full">
              <div className="w-8 h-8 rounded-full bg-[#68dba9] text-[#005137] flex items-center justify-center font-bold text-sm">
                {user.initial}
              </div>
              <div className="flex flex-col text-left hidden md:flex">
                <span className="text-sm font-semibold text-[#131b2e] leading-tight">{user.name}</span>
                <span className="text-xs text-[#3d4a42]">Supervisor(a)</span>
              </div>
            </div>
            <Link className="inline-flex items-center gap-1.5 bg-[#eaedff] hover:bg-[#dae2fd] transition-colors px-3.5 py-2 rounded-full text-sm font-medium shadow-sm" href="/">
              <LayoutDashboard className="w-4 h-4 text-[#006948]" />
              <span className="hidden sm:inline">Volver a</span> <span className="font-bold">ValisFin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Viewport Shell */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
        
        {/* Hero Header */}
        <section className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
              <span className="text-xs sm:text-sm text-[#006948] uppercase font-semibold tracking-wider font-mono">Panel en Vivo • Panamá</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold">Centro de Control & Cobertura</h1>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#006948] hover:bg-[#00855d] text-white text-sm font-semibold shadow-md transition-all">
              + Registrar Venta
            </button>
          </div>
        </section>

        {/* Tab Switcher */}
        <div className="bg-[#f2f3ff] p-1.5 rounded-2xl mb-6 sm:mb-8 flex items-center justify-between gap-2 shadow-inner overflow-x-auto">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-0">
            <button 
              onClick={() => setActiveTab('ventas')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'ventas' ? 'bg-white text-[#006948] shadow-sm' : 'text-[#3d4a42] hover:text-[#131b2e]'}`}
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Ventas & Métricas</span>
            </button>
            <button 
              onClick={() => setActiveTab('tareas')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'tareas' ? 'bg-white text-[#006948] shadow-sm' : 'text-[#3d4a42] hover:text-[#131b2e]'}`}
            >
              <View className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Tareas & Cronograma</span>
            </button>
            <button 
              onClick={() => setActiveTab('mapa')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'mapa' ? 'bg-white text-[#006948] shadow-sm' : 'text-[#3d4a42] hover:text-[#131b2e]'}`}
            >
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Mapa & Locales BI</span>
            </button>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[#3d4a42] font-mono text-xs pr-3 whitespace-nowrap">
            <RefreshCw className="w-4 h-4 text-[#006948]" />
            <span>Sincronizado: En Vivo</span>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'ventas' && (
          <MetricasVentas metas={initialData.metas} vendedores={initialData.vendedores} />
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
