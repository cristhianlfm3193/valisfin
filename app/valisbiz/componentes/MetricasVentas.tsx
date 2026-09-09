'use client';

import { Sparkles, Upload, CheckCircle2, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';
import type { MetaSupervisor, Vendedor } from '@/types/valisbiz';

interface MetricasVentasProps {
  metas: MetaSupervisor;
  vendedores: Vendedor[];
}

export default function MetricasVentas({ metas, vendedores }: MetricasVentasProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* AI OCR Highlight Banner Card */}
      <div className="w-full bg-gradient-to-r from-[#eaedff] to-[#adedd3]/30 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-[#006948] flex items-center justify-center shadow-md flex-shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-[#131b2e]">Smart Ingestion con Visión Computacional</span>
              <span className="bg-[#006948] text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full uppercase font-semibold">OCR Activo</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3d4a42] mt-1">
              Sube la foto del manifiesto diario o carga el Excel de consolidado Keiko para cuadrar facturación en segundos.
            </p>
          </div>
        </div>
        <label className="cursor-pointer w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#faf8ff] text-[#006948] text-sm font-bold shadow-sm whitespace-nowrap transition-transform active:scale-95 border border-slate-100">
          <Upload className="w-5 h-5" />
          <span>Cargar Manifiesto / Excel</span>
          <input accept=".jpg,.png,.xlsx,.csv" className="hidden" type="file" />
        </label>
      </div>

      {/* Bento Grid: Vendedores KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vendedores.map((vendedor, index) => {
          // Asignar colores según índice o alcance para simular el diseño
          const isWarning = vendedor.porcentaje_alcance < 70;
          const isGood = vendedor.porcentaje_alcance >= 80;
          
          let bgColor = 'bg-[#adedd3]';
          let textColor = 'text-[#306d58]';
          let barColor = 'bg-[#006948]';
          let Icon = Clock;
          let iconBg = 'bg-[#4648d4] text-white';

          if (isGood) {
            Icon = CheckCircle2;
            iconBg = 'bg-[#006948] text-[#adedd3]';
          } else if (isWarning) {
            bgColor = 'bg-[#ffdad6]';
            textColor = 'text-[#93000a]';
            barColor = 'bg-[#ba1a1a]';
            Icon = AlertTriangle;
            iconBg = 'bg-[#ba1a1a] text-[#ffdad6]';
          } else {
            bgColor = 'bg-[#b0f0d6]';
            textColor = 'text-[#005137]';
          }

          const initials = vendedor.nombre.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

          return (
            <div key={vendedor.id} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-100">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${bgColor} ${textColor} text-xl flex items-center justify-center font-bold`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#131b2e] leading-tight">{vendedor.nombre}</h3>
                      <span className="text-xs text-[#3d4a42]">{vendedor.ruta_asignada || 'Sin ruta'}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${bgColor} ${textColor}`}>
                    {vendedor.porcentaje_alcance.toFixed(1)}%
                  </span>
                </div>

                <div className="my-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-[#3d4a42] font-semibold">Avance de Cuota</span>
                    <span className="font-mono text-sm font-bold text-[#131b2e]">
                      B/. {vendedor.venta_real_acumulada.toLocaleString()} / {vendedor.cuota_mensual.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#eaedff] rounded-full overflow-hidden">
                    <div className={`${barColor} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.min(vendedor.porcentaje_alcance, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 bg-[#f2f3ff]/50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-[#3d4a42] font-semibold">Brecha / GAP</span>
                  <span className={`font-mono text-xl font-bold ${isWarning ? 'text-[#ba1a1a]' : 'text-[#006948]'}`}>
                    B/. {vendedor.gap_ventas.toLocaleString()}
                  </span>
                </div>
                <Icon className={`w-10 h-10 p-2 rounded-xl ${iconBg}`} />
              </div>
            </div>
          );
        })}
        {vendedores.length === 0 && (
          <div className="col-span-3 text-center py-8 text-slate-500">
            No hay vendedores registrados.
          </div>
        )}
      </div>

      {/* General Performance Analytics Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 flex flex-col gap-2">
          <span className="text-xs uppercase font-semibold text-[#006948]">Consolidado Keiko Supervisión</span>
          <h2 className="text-2xl font-bold text-[#131b2e]">B/. {Number(metas?.venta_global_acumulada || 0).toLocaleString()} Recaudados</h2>
          <p className="text-sm text-[#3d4a42]">
            Meta Global: <span className="font-mono font-bold text-[#131b2e]">B/. {Number(metas?.cuota_global || 85000).toLocaleString()}</span> ({Number(metas?.porcentaje_global || 0).toFixed(1)}% alcanzado).
          </p>
          <div className="flex gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-[#006948] font-mono text-sm font-bold">
              <ArrowUpRight className="w-4 h-4" /> +8.4% vs mes previo
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm font-semibold text-[#3d4a42]">
            <span>Distribución de Cumplimiento</span>
            <span>Objetivo Mínimo: 80%</span>
          </div>
          
          <div className="h-10 w-full flex rounded-xl overflow-hidden bg-[#eaedff] p-1 gap-1">
            {vendedores.map((v, i) => {
              const bgColors = ['bg-[#006948]', 'bg-[#2b6954]', 'bg-[#6d7a72]'];
              const textColors = ['text-white', 'text-white', 'text-white'];
              const contribution = metas.cuota_global > 0 ? (v.venta_real_acumulada / metas.cuota_global) * 100 : 0;
              
              if (contribution <= 0) return null;
              
              return (
                <div 
                  key={v.id}
                  className={`${bgColors[i % 3]} rounded-lg flex items-center justify-center ${textColors[i % 3]} font-mono text-xs font-bold transition-all hover:opacity-90`} 
                  style={{ width: `${contribution}%` }} 
                  title={`${v.nombre} (${contribution.toFixed(1)}%)`}
                >
                  {contribution > 10 ? `${v.nombre.split(' ')[0]}: ${contribution.toFixed(0)}%` : ''}
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-xs text-[#3d4a42] font-mono">
            {vendedores.slice(0,3).map((v, i) => {
              const bgColors = ['bg-[#006948]', 'bg-[#2b6954]', 'bg-[#6d7a72]'];
              const contribution = metas.cuota_global > 0 ? (v.venta_real_acumulada / metas.cuota_global) * 100 : 0;
              return (
                <span key={v.id} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${bgColors[i % 3]} inline-block`}></span> 
                  {v.nombre.split(' ')[0]} ({contribution.toFixed(1)}%)
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
