'use client';

import { CheckCircle2, AlertTriangle, Clock, ArrowUpRight, Trophy, TrendingDown } from 'lucide-react';
import type { MetaSupervisor, ResumenMensualVendedor } from '@/types/valisbiz';
import { calcularBonoJennifer, TABLA_BONOS_JENNIFER } from '@/types/valisbiz';

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface MetricasVentasProps {
  metas: MetaSupervisor;
  resumenMensual: ResumenMensualVendedor[];
  mesPeriodo: number;
  anioPeriodo: number;
  isMesCerrado: boolean;
}

function getVendorColors(pct: number) {
  if (pct >= 100) return { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', icon: CheckCircle2, iconClass: 'text-white bg-emerald-500' };
  if (pct >= 85) return { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500', icon: Clock, iconClass: 'text-white bg-blue-500' };
  return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', bar: 'bg-red-400', icon: AlertTriangle, iconClass: 'text-white bg-red-400' };
}

function getInitials(nombre: string) {
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function MetricasVentas({
  metas, resumenMensual, mesPeriodo, anioPeriodo, isMesCerrado
}: MetricasVentasProps) {
  const porcentajeGlobal = Number(metas.porcentaje_global || 0);
  const bonoInfo = calcularBonoJennifer(porcentajeGlobal);
  const mesLabel = `${MESES[mesPeriodo]} ${anioPeriodo}`;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ===== TARJETA DE JENNIFER (SUPERVISORA) ===== */}
      <div className="w-full bg-gradient-to-r from-pink-600 to-rose-500 rounded-2xl p-5 sm:p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Identidad y datos */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-2xl shadow-inner border border-white/30">
              JC
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold">Jennifer Camaño</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold uppercase tracking-wider border border-white/30">
                  Supervisora Regional
                </span>
              </div>
              <p className="text-pink-100 text-sm mt-0.5">Panamá Oeste — Zona Chorrera & Centro</p>
            </div>
          </div>

          {/* Right: Bono y cumplimiento */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* % Global */}
            <div className="flex flex-col items-center bg-white/15 rounded-xl px-4 py-3 border border-white/20 min-w-[90px]">
              <span className="font-mono text-2xl font-bold">{porcentajeGlobal.toFixed(1)}%</span>
              <span className="text-pink-100 text-[11px] font-medium">Equipo {mesLabel}</span>
            </div>

            {/* Bono proyectado */}
            <div className={`flex flex-col items-center rounded-xl px-4 py-3 border min-w-[110px] ${bonoInfo.bono > 0 ? 'bg-yellow-300/20 border-yellow-300/40' : 'bg-white/10 border-white/20'}`}>
              <span className={`font-mono text-2xl font-bold ${bonoInfo.bono > 0 ? 'text-yellow-200' : 'text-white/60'}`}>
                B/. {bonoInfo.bono}
              </span>
              <span className="text-pink-100 text-[11px] font-medium">Bono {isMesCerrado ? 'Real' : 'Proyectado'}</span>
            </div>

            {/* Tabla de bonos compacta */}
            <div className="hidden lg:flex flex-col gap-0.5 text-[10px]">
              {TABLA_BONOS_JENNIFER.slice().reverse().map((tier, i) => {
                const isActive = porcentajeGlobal >= tier.min && porcentajeGlobal <= tier.max;
                return (
                  <div key={i} className={`flex items-center gap-2 px-2 py-0.5 rounded ${isActive ? 'bg-white/25 font-bold' : 'opacity-60'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-yellow-300' : 'bg-white/40'}`}></span>
                    <span className="whitespace-nowrap">{tier.label}</span>
                    <span className="ml-auto font-mono">B/.{tier.bono}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Barra de progreso global del equipo */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-pink-100 mb-1.5">
            <span>Progreso del Equipo — Meta B/. {Number(metas.cuota_global).toLocaleString()}</span>
            <span className="font-mono font-bold text-white">
              B/. {Number(metas.venta_global_acumulada).toLocaleString()} recaudados
            </span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-1000 relative"
              style={{ width: `${Math.min(porcentajeGlobal, 100)}%` }}
            >
              {porcentajeGlobal >= 100 && (
                <div className="absolute inset-0 bg-yellow-300/40 animate-pulse rounded-full" />
              )}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-pink-200 mt-1 font-mono">
            <span>85% mín. bono</span>
            <span>100% meta completa</span>
            <span>110% bono máx.</span>
          </div>
        </div>
      </div>

      {/* ===== TARJETAS DE VENDEDORES ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-bold text-slate-800">Equipo de Vendedores</h2>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${isMesCerrado ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {isMesCerrado ? `📅 ${mesLabel} — Cerrado` : `🟢 ${mesLabel} — En Curso`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resumenMensual.map((vendedor) => {
            const pct = Number(vendedor.porcentaje_vendido || 0);
            const colors = getVendorColors(pct);
            const Icon = colors.icon;
            const initials = getInitials(vendedor.nombre);
            const isOverAchieved = pct >= 100;
            const facturado = Number(vendedor.total_facturado || 0);

            return (
              <div key={vendedor.vendedor_id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.text} text-base flex items-center justify-center font-bold flex-shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{vendedor.nombre}</h3>
                      <span className="text-[11px] text-slate-500">{vendedor.ruta_asignada || 'Sin ruta'}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg font-mono text-xs font-bold ${colors.badge} flex-shrink-0`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>

                {/* Barra de progreso */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Avance de Cuota</span>
                    <span className="font-mono font-semibold text-slate-700">
                      B/. {Number(vendedor.total_vendido).toLocaleString('es-PA', { minimumFractionDigits: 2 })} / {Number(vendedor.cuota_mensual).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${colors.bar} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>

                {/* GAP y logro */}
                <div className={`${colors.bg} rounded-xl p-3 flex items-center justify-between`}>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {isOverAchieved ? '🏆 Superó la meta' : 'Brecha / GAP'}
                    </span>
                    <span className={`font-mono text-base font-bold ${isOverAchieved ? 'text-emerald-600' : colors.text}`}>
                      {isOverAchieved ? '+' : ''}B/. {Math.abs(Number(vendedor.gap_vendido)).toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Icon className={`w-9 h-9 p-2 rounded-xl ${colors.iconClass}`} />
                </div>

                {/* Facturado (si existe) */}
                {facturado > 0 && (
                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Facturado (Finanzas)</span>
                    <span className="font-mono font-bold text-slate-700">B/. {facturado.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            );
          })}
          {resumenMensual.length === 0 && (
            <div className="col-span-3 text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">
              No hay vendedores registrados.
            </div>
          )}
        </div>
      </div>

      {/* ===== TABLA VENDIDO vs FACTURADO ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Vendido vs. Facturado — {mesLabel}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Compara lo vendido por el equipo con lo que Finanzas confirmó en facturación</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold font-mono">
            {resumenMensual.length} vendedores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Vendedor</th>
                <th className="py-3 px-4 text-right">Meta Mes</th>
                <th className="py-3 px-4 text-right">Vendido (Reportado)</th>
                <th className="py-3 px-4 text-right">Facturado (Finanzas)</th>
                <th className="py-3 px-4 text-center">% Meta</th>
                <th className="py-3 px-4 text-right">GAP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {resumenMensual.map((v) => {
                const pct = Number(v.porcentaje_vendido || 0);
                const facturado = Number(v.total_facturado || 0);
                const gap = Number(v.gap_vendido);
                const isGood = pct >= 85;
                const isOver = pct >= 100;
                return (
                  <tr key={v.vendedor_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${isOver ? 'bg-emerald-100 text-emerald-700' : isGood ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {getInitials(v.nombre)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-800 block leading-tight">{v.nombre}</span>
                          <span className="text-[11px] text-slate-400">{v.ruta_asignada || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm font-semibold text-slate-700">
                      B/. {Number(v.cuota_mensual).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm font-bold text-slate-900">
                      B/. {Number(v.total_vendido).toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-600">
                      {facturado > 0
                        ? `B/. ${facturado.toLocaleString('es-PA', { minimumFractionDigits: 2 })}`
                        : <span className="text-slate-300 text-xs">Sin datos</span>
                      }
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${isOver ? 'bg-emerald-100 text-emerald-700' : isGood ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono text-sm font-bold ${isOver ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isOver ? '+' : ''}B/. {Math.abs(gap).toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer totales */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="py-3 px-4 text-sm font-bold text-slate-700">TOTAL EQUIPO</td>
                <td className="py-3 px-4 text-right font-mono text-sm font-bold text-slate-800">
                  B/. {Number(metas.cuota_global).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm font-bold text-slate-900">
                  B/. {Number(metas.venta_global_acumulada).toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm text-slate-600">—</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${Number(metas.porcentaje_global) >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {Number(metas.porcentaje_global || 0).toFixed(1)}%
                  </span>
                </td>
                <td className={`py-3 px-4 text-right font-mono text-sm font-bold ${Number(metas.porcentaje_global) >= 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                  B/. {Math.abs(Number(metas.gap_global)).toLocaleString('es-PA', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
