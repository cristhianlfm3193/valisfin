'use client';

import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { MetaSupervisor, ResumenMensualVendedor } from '@/types/valisbiz';
import { calcularBonoJennifer, TABLA_BONOS_JENNIFER } from '@/types/valisbiz';
import TablasHistorial from './TablasHistorial';

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface RegistroFila {
  id: string;
  vendedor_nombre: string;
  fecha: string;
  monto: number;
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

interface MetricasVentasProps {
  metas: MetaSupervisor;
  resumenMensual: ResumenMensualVendedor[];
  mesPeriodo: number;
  anioPeriodo: number;
  isMesCerrado: boolean;
  registrosFacturado: RegistroFila[];
  registrosVendido: RegistroVendidoFila[];
}

function getColors(pct: number) {
  if (pct >= 100) return { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', icon: CheckCircle2, iconBg: 'bg-emerald-500 text-white' };
  if (pct >= 85)  return { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500', icon: Clock, iconBg: 'bg-blue-500 text-white' };
  return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', bar: 'bg-red-400', icon: AlertTriangle, iconBg: 'bg-red-400 text-white' };
}

function getInitials(nombre: string) {
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function fmt(n: number) {
  return n.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MetricasVentas({ metas, resumenMensual, mesPeriodo, anioPeriodo, isMesCerrado, registrosFacturado, registrosVendido }: MetricasVentasProps) {
  const porcentajeGlobal = Number(metas.porcentaje_global || 0);
  const facturadoGlobal = Number(metas.venta_global_acumulada || 0);
  const cuotaGlobal = Number(metas.cuota_global || 85000);
  const bonoInfo = calcularBonoJennifer(porcentajeGlobal);
  const mesLabel = `${MESES[mesPeriodo]} ${anioPeriodo}`;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── TARJETA JENNIFER (SUPERVISORA) ── */}
      <div className="w-full bg-gradient-to-r from-pink-600 to-rose-500 rounded-2xl p-5 sm:p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">

          {/* Identidad */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-2xl shadow-inner border border-white/30 flex-shrink-0">
              JC
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold">Jennifer Camaño</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold uppercase tracking-wider border border-white/30">
                  Supervisora Regional
                </span>
              </div>
              <p className="text-pink-100 text-sm mt-0.5">Panamá Oeste · Chorrera & Centro</p>
              <p className="text-pink-200 text-[11px] mt-1">
                Base: B/.1,000 · Bono máx: B/.500 · Ingreso máx: B/.1,500
              </p>
            </div>
          </div>

          {/* Métricas de bono */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex flex-col items-center bg-white/15 rounded-xl px-4 py-3 border border-white/20 min-w-[90px]">
              <span className="font-mono text-2xl font-bold">{porcentajeGlobal.toFixed(1)}%</span>
              <span className="text-pink-100 text-[11px] font-medium">Equipo {mesLabel}</span>
              <span className="text-pink-200 text-[10px]">(Facturado)</span>
            </div>

            <div className={`flex flex-col items-center rounded-xl px-4 py-3 border min-w-[110px] ${bonoInfo.bono > 0 ? 'bg-yellow-300/20 border-yellow-300/40' : 'bg-white/10 border-white/20'}`}>
              <span className={`font-mono text-2xl font-bold ${bonoInfo.bono > 0 ? 'text-yellow-200' : 'text-white/60'}`}>
                B/.{bonoInfo.bono}
              </span>
              <span className="text-pink-100 text-[11px] font-medium">Bono {isMesCerrado ? 'Real' : 'Proyectado'}</span>
              <span className="text-pink-200 text-[10px]">{bonoInfo.label}</span>
            </div>

            {/* Tabla de bonos */}
            <div className="hidden lg:flex flex-col gap-0.5 text-[10px]">
              {[...TABLA_BONOS_JENNIFER].reverse().map((tier, i) => {
                const isActive = porcentajeGlobal >= tier.min && porcentajeGlobal <= tier.max;
                return (
                  <div key={i} className={`flex items-center gap-2 px-2 py-0.5 rounded ${isActive ? 'bg-white/25 font-bold' : 'opacity-60'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-yellow-300' : 'bg-white/40'}`} />
                    <span className="whitespace-nowrap">{tier.label}</span>
                    <span className="ml-auto font-mono">B/.{tier.bono}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Barra de progreso global */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-pink-100 mb-1.5">
            <span>Facturado Equipo · Meta B/.{cuotaGlobal.toLocaleString()}</span>
            <span className="font-mono font-bold text-white">B/.{fmt(facturadoGlobal)}</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(porcentajeGlobal, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-pink-200 mt-1 font-mono">
            <span>85% → B/.150</span><span>100% → B/.425</span><span>110% → B/.500</span>
          </div>
        </div>
      </div>

      {/* ── TARJETAS DE VENDEDORES ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-bold text-slate-800">Equipo de Vendedores</h2>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${isMesCerrado ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {isMesCerrado ? `📅 ${mesLabel} · Mes cerrado` : `🟢 ${mesLabel} · En curso`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resumenMensual.map(v => {
            const pct = Number(v.porcentaje_facturado || 0);
            const c = getColors(pct);
            const Icon = c.icon;
            const isOver = pct >= 100;

            return (
              <div key={v.vendedor_id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} text-sm font-bold flex items-center justify-center flex-shrink-0`}>
                      {getInitials(v.nombre)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{v.nombre}</h3>
                      <span className="text-[11px] text-slate-500">{v.ruta_asignada || 'Sin ruta'}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg font-mono text-xs font-bold ${c.badge} flex-shrink-0`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>

                {/* Barra de progreso — basada en FACTURADO */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-medium text-slate-700">Facturado (Finanzas)</span>
                    <span className="font-mono font-semibold text-slate-800">
                      B/.{fmt(v.total_facturado)} / {Number(v.cuota_mensual).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${c.bar} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>

                {/* GAP */}
                <div className={`${c.bg} rounded-xl p-3 flex items-center justify-between`}>
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block">
                      {isOver ? '🏆 Superó la meta' : 'Brecha / GAP'}
                    </span>
                    <span className={`font-mono text-base font-bold ${isOver ? 'text-emerald-600' : c.text}`}>
                      {isOver ? '+' : ''}B/.{fmt(Math.abs(v.gap_facturado))}
                    </span>
                  </div>
                  <Icon className={`w-9 h-9 p-2 rounded-xl ${c.iconBg}`} />
                </div>

                {/* Vendido Reportado — solo informativo */}
                <div className="border-t border-slate-100 pt-2.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>
                      Vendido Reportado (vendedor)
                    </span>
                    <span className="font-mono text-slate-500">
                      {v.total_vendido_reportado > 0 ? `B/.${fmt(v.total_vendido_reportado)}` : 'Sin registros'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Solo informativo · No aplica para bono</p>
                </div>
              </div>
            );
          })}

          {resumenMensual.length === 0 && (
            <div className="col-span-3 text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">
              No hay datos para este mes.
            </div>
          )}
        </div>
      </div>

      {/* ── TABLA FACTURADO vs VENDIDO REPORTADO ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tabla Comparativa — {mesLabel}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              El % de cuota y el bono de Jennifer se calculan con <strong>Facturado (Finanzas)</strong>. 
              El Vendido Reportado es referencia del vendedor.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Vendedor</th>
                <th className="py-3 px-4 text-right">Meta Mes</th>
                <th className="py-3 px-4 text-right">
                  <span className="text-pink-600">Facturado</span>
                  <span className="block font-normal normal-case text-[10px] text-slate-400">Finanzas · base de bono</span>
                </th>
                <th className="py-3 px-4 text-right">
                  Vendido Reportado
                  <span className="block font-normal normal-case text-[10px] text-slate-400">Vendedor · solo referencia</span>
                </th>
                <th className="py-3 px-4 text-center">% Cuota</th>
                <th className="py-3 px-4 text-right">GAP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {resumenMensual.map(v => {
                const pct = Number(v.porcentaje_facturado || 0);
                const gap = Number(v.gap_facturado);
                const isOver = pct >= 100;
                const isGood = pct >= 85;
                return (
                  <tr key={v.vendedor_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${isOver ? 'bg-emerald-100 text-emerald-700' : isGood ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {getInitials(v.nombre)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-800 block">{v.nombre}</span>
                          <span className="text-[11px] text-slate-400">{v.ruta_asignada || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm font-semibold text-slate-700">
                      B/.{Number(v.cuota_mensual).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-pink-700">
                      B/.{fmt(v.total_facturado)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-500">
                      {v.total_vendido_reportado > 0
                        ? `B/.${fmt(v.total_vendido_reportado)}`
                        : <span className="text-slate-300 text-xs">Sin datos</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${isOver ? 'bg-emerald-100 text-emerald-700' : isGood ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono text-sm font-bold ${isOver ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isOver ? '+' : ''}B/.{fmt(Math.abs(gap))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="py-3 px-4 text-sm font-bold text-slate-700">TOTAL EQUIPO</td>
                <td className="py-3 px-4 text-right font-mono text-sm font-bold text-slate-800">B/.{cuotaGlobal.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-mono text-sm font-bold text-pink-700">B/.{fmt(facturadoGlobal)}</td>
                <td className="py-3 px-4 text-right font-mono text-sm text-slate-500">—</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${porcentajeGlobal >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {porcentajeGlobal.toFixed(1)}%
                  </span>
                </td>
                <td className={`py-3 px-4 text-right font-mono text-sm font-bold ${porcentajeGlobal >= 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                  B/.{fmt(Math.abs(Number(metas.gap_global)))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── TABLAS DE HISTORIAL ── */}
      <TablasHistorial
        registrosFacturado={registrosFacturado}
        registrosVendido={registrosVendido}
      />

    </div>
  );
}
