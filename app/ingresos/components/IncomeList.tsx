'use client';

import { useState } from 'react';
import { CheckCircle2, Check, Clock, CalendarDays, CalendarCheck } from 'lucide-react';
import { quincena1Ingresos, quincena2Ingresos } from '@/lib/mockData';

// We need to merge them to handle state uniformly, or handle them separately.
// The easiest way is to use the initial mock data as the default state.

export function IncomeList() {
  const [items, setItems] = useState([...quincena1Ingresos, ...quincena2Ingresos]);

  const toggleConfirm = (id: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'pending' ? 'received' : 'pending', dateReceived: item.status === 'pending' ? new Date().toLocaleDateString('es-PA') : null }
        : item
    ));
  };

  const q1Items = items.filter(i => quincena1Ingresos.find(q1 => q1.id === i.id));
  const q2Items = items.filter(i => quincena2Ingresos.find(q2 => q2.id === i.id));

  const renderItem = (item: any) => {
    const isReceived = item.status === 'received';
    
    return (
      <div 
        key={item.id} 
        className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-sm transition hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-700 font-bold text-sm">
            {item.initials}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{item.title}</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px] sm:text-xs">{item.person}</span>
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
              <span>Fecha prevista: {item.dateExpected}</span>
              {isReceived ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5" /> Recibido: {item.dateReceived}
                </span>
              ) : (
                <span className="text-slate-500">{item.type}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-5">
          <div className="text-right">
            <div className={`text-lg sm:text-xl font-bold font-mono ${isReceived ? 'text-emerald-700' : 'text-slate-900'}`}>
              +B/. {item.amount.toFixed(2)}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {isReceived ? 'Efectivo en cuenta' : 'Por confirmar'}
            </div>
          </div>
          <div>
            {isReceived ? (
              <button 
                onClick={() => toggleConfirm(item.id)}
                className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 border border-emerald-200/60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmado</span>
              </button>
            ) : (
              <button 
                onClick={() => toggleConfirm(item.id)}
                className="px-5 py-2.5 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 font-semibold text-xs sm:text-sm shadow-sm transition hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar recibido</span>
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
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Primera Quincena (1 al 15 de Septiembre)</h2>
              <p className="text-xs sm:text-sm text-slate-500">Pagos de inicio de mes, colegiatura y primera ronda de compromisos familiares.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs w-fit border border-teal-200/60">
            <CheckCircle2 className="w-4 h-4" /> 100% Completada
          </span>
        </div>
        <div className="space-y-3">
          {q1Items.map(renderItem)}
        </div>
      </div>

      {/* 2da Quincena */}
      <div className="space-y-3.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">2</div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Segunda Quincena (16 al 30 de Septiembre)</h2>
              <p className="text-xs sm:text-sm text-slate-500">Cierres de mes, servicios del hogar, ahorros y amortizaciones.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs w-fit border border-slate-200">
            <Clock className="w-4 h-4" /> 5 Cobros en Espera
          </span>
        </div>
        <div className="space-y-3">
          {q2Items.map(renderItem)}
        </div>
      </div>
    </div>
  );
}
