'use client';

import { Check, Info } from 'lucide-react';

interface MetricsSummaryProps {
  totalPaid: number;
  totalPending: number;
  paidCount: number;
  pendingCount: number;
  progressPercent: number;
}

export function MetricsSummary({
  totalPaid,
  totalPending,
  paidCount,
  pendingCount,
  progressPercent,
}: MetricsSummaryProps) {
  const formattedPaid = `B/. ${totalPaid.toFixed(2)}`;
  const formattedPending = `B/. ${totalPending.toFixed(2)}`;
  const totalItems = paidCount + pendingCount;

  return (
    <section className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card: Pagado al momento */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Pagado</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
                {formattedPaid}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{paidCount} cuotas cubiertas</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        {/* Card: Pendiente Fijo */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Por Pagar (Fijo)</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono">
                {formattedPending}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              <span>{pendingCount}</span> compromisos pendientes
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Card: Progreso Mensual */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Cumplimiento</p>
            <span className="text-xs font-bold text-slate-700">
              {progressPercent}% ({paidCount}/{totalItems})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-600" />
            Montos predeterminados sin variaciones
          </p>
        </div>
      </div>
    </section>
  );
}
