'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Check, Clock, CalendarDays, CalendarCheck, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { toggleIncomeStatus } from '@/app/actions/income';

import { EditIncomeModal } from './EditIncomeModal';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
export function IncomeList({ incomes, monthName = 'del Mes' }: { incomes: any[], monthName?: string }) {
  const [isPending, startTransition] = useTransition();

  const toggleConfirm = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await toggleIncomeStatus(id, currentStatus);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const q1Items = incomes.filter(i => i.period === 'q1');
  const q2Items = incomes.filter(i => i.period === 'q2' || i.period === 'eventual');

  const q1PendingCount = q1Items.filter(i => !i.is_received).length;
  const q2PendingCount = q2Items.filter(i => !i.is_received).length;

  const [q1Expanded, setQ1Expanded] = useState(q1PendingCount > 0 || q1Items.length === 0);
  const [q2Expanded, setQ2Expanded] = useState(true);
  
  const [q1ShowAll, setQ1ShowAll] = useState(false);
  const [q2ShowAll, setQ2ShowAll] = useState(false);

  const ITEMS_LIMIT = 4;

  const q1VisibleItems = q1ShowAll ? q1Items : q1Items.slice(0, ITEMS_LIMIT);
  const q2VisibleItems = q2ShowAll ? q2Items : q2Items.slice(0, ITEMS_LIMIT);

  const renderBadge = (pendingCount: number, totalCount: number) => {
    if (totalCount === 0) return null;
    if (pendingCount === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs w-fit border border-teal-200/60">
          <CheckCircle2 className="w-4 h-4" /> 100% Completada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs w-fit border border-slate-200">
        <Clock className="w-4 h-4" /> {pendingCount} {pendingCount === 1 ? 'Cobro' : 'Cobros'} en Espera
      </span>
    );
  };

  const renderItem = (item: any) => {
    const isReceived = item.is_received;
    const isCristhian = (item.profiles?.first_name || '').toLowerCase().includes('cristhian');
    const initials = isCristhian ? 'CF' : 'JC';
    const personName = isCristhian ? 'Cristhian' : 'Jennifer';
    
    return (
      <div 
        key={item.id} 
        className={`bg-white rounded-xl p-4 sm:p-5 border shadow-sm transition hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${isPending ? 'opacity-70 pointer-events-none' : ''} ${isReceived ? 'border-emerald-200/60' : 'border-slate-200/80'}`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 font-bold text-sm ${
            isCristhian ? 'bg-slate-50 border-slate-100 text-slate-700' : 'bg-pink-50 border-pink-100 text-pink-600'
          }`}>
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{item.description}</h3>
              <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] sm:text-xs ${
                isCristhian ? 'bg-slate-100 text-slate-600' : 'bg-pink-100 text-pink-700'
              }`}>{personName}</span>
              <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] sm:text-xs flex items-center gap-1 ${
                isReceived ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}>
                {isReceived ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Recibido</>
                ) : (
                  <><Clock className="w-3.5 h-3.5" /> Pendiente</>
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs sm:text-sm">
              <span>Fecha prevista: {item.date_expected?.split('-').reverse().join('/')}</span>
              {isReceived ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5" /> En cuenta
                </span>
              ) : (
                <span className="text-slate-500 capitalize">{item.category}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100/80 shrink-0">
          <div className="text-left md:text-right">
            <div className={`text-lg sm:text-xl font-bold font-mono whitespace-nowrap ${isReceived ? 'text-emerald-700' : 'text-slate-900'}`}>
              B/. {formatCurrency(item.amount)}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              {isReceived ? 'Efectivo en cuenta' : 'Por confirmar'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EditIncomeModal item={item} />
            {isReceived ? (
              <button 
                onClick={() => toggleConfirm(item.id, isReceived)}
                title="Deshacer confirmación"
                className="group relative px-3 sm:px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200/60 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 border border-emerald-200/60 shrink-0 overflow-hidden w-auto sm:w-[125px] justify-center"
              >
                <div className="flex items-center gap-1.5 group-hover:hidden">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Confirmado</span>
                </div>
                <div className="hidden items-center gap-1.5 group-hover:flex">
                  <Undo2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Deshacer</span>
                </div>
              </button>
            ) : (
              <button 
                onClick={() => toggleConfirm(item.id, isReceived)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 font-semibold text-xs sm:text-sm shadow-sm transition hover:scale-105 active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Confirmar recibido</span>
                <span className="sm:hidden">Confirmar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1ra Quincena */}
      <div className="space-y-1">
        <button 
          onClick={() => setQ1Expanded(!q1Expanded)}
          className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 transition text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Primera Quincena (1 al 15 de {monthName})</h2>
              <p className="text-xs sm:text-sm text-slate-500">Pagos de inicio de mes, colegiatura y primera ronda de compromisos familiares.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto mt-2 sm:mt-0">
            {renderBadge(q1PendingCount, q1Items.length)}
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition">
              {q1Expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>
        
        {q1Expanded && (
          <div className="space-y-3 pt-2">
            {q1VisibleItems.map(renderItem)}
            
            {q1Items.length > ITEMS_LIMIT && (
              <button 
                onClick={() => setQ1ShowAll(!q1ShowAll)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 font-semibold text-sm hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 transition"
              >
                {q1ShowAll ? 'Ocultar detalles' : `Ver ${q1Items.length - ITEMS_LIMIT} ingresos más`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2da Quincena */}
      <div className="space-y-1 pt-4">
        <button 
          onClick={() => setQ2Expanded(!q2Expanded)}
          className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 transition text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">2</div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Segunda Quincena (16 al 30/31 de {monthName})</h2>
              <p className="text-xs sm:text-sm text-slate-500">Cierres de mes, servicios del hogar, ahorros y amortizaciones.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto mt-2 sm:mt-0">
            {renderBadge(q2PendingCount, q2Items.length)}
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition">
              {q2Expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {q2Expanded && (
          <div className="space-y-3 pt-2">
            {q2VisibleItems.map(renderItem)}
            
            {q2Items.length > ITEMS_LIMIT && (
              <button 
                onClick={() => setQ2ShowAll(!q2ShowAll)}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 font-semibold text-sm hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 transition"
              >
                {q2ShowAll ? 'Ocultar detalles' : `Ver ${q2Items.length - ITEMS_LIMIT} ingresos más`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
