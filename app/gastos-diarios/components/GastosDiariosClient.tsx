'use client';

import { useState, useMemo } from 'react';
import { DailyExpense } from '@/app/actions/daily_expenses';
import { Wallet, SlidersHorizontal, PlusCircle, ShoppingCart, Fuel, PartyPopper, Search } from 'lucide-react';
import { AddDailyExpenseModal } from './AddDailyExpenseModal';

interface GastosDiariosClientProps {
  initialExpenses: DailyExpense[];
}

export function GastosDiariosClient({ initialExpenses }: GastosDiariosClientProps) {
  const [expenses, setExpenses] = useState<DailyExpense[]>(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');

  // Hardcoded budgets for now as discussed
  const budgets = {
    Supermercado: 200,
    Gasolina: 200,
    Ocio: 150
  };

  // Currently only calculating budgets for the current month
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date();
    const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return e.date.startsWith(currentMonth);
  });

  // Calculate spent amounts per budget category
  // Assuming "Alimentación" and "Supermercado" group together for Supermercado budget?
  // Let's use strict match for now, or group them logically.
  const spentSupermercado = currentMonthExpenses
    .filter(e => e.category === 'Supermercado' || e.category === 'Alimentación')
    .reduce((sum, e) => sum + e.amount, 0);

  const spentGasolina = currentMonthExpenses
    .filter(e => e.category === 'Gasolina' || e.category === 'Transporte')
    .reduce((sum, e) => sum + e.amount, 0);

  const spentOcio = currentMonthExpenses
    .filter(e => e.category === 'Ocio' || e.category === 'Restaurante')
    .reduce((sum, e) => sum + e.amount, 0);

  const getProgress = (spent: number, total: number) => {
    const pct = (spent / total) * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      if (q && !e.detail.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) {
        return false;
      }
      
      // 2. Category Filter
      if (categoryFilter !== 'all' && e.category !== categoryFilter) {
        return false;
      }
      
      // 3. Person Filter
      if (personFilter !== 'all' && e.person.toLowerCase() !== personFilter.toLowerCase()) {
        return false;
      }
      
      return true;
    });
  }, [expenses, searchQuery, categoryFilter, personFilter]);

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Egresos cotidianos en tiempo real
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gastos Diarios</h1>
        </div>
        
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button className="sm:hidden flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full text-sm font-bold shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Registrar gasto</span>
          </button>
        </div>
      </div>

      {/* Bento Trio: Dynamic Budget Tracking Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
        
        {/* Supermercado */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-slate-100">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Supermercado</h2>
                <p className="text-xs text-slate-500">Presupuesto mensual</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {Math.round(getProgress(spentSupermercado, budgets.Supermercado))}% usado
            </span>
          </div>
          <div className="space-y-3 mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-500 font-mono tracking-tight">-B/. {spentSupermercado.toFixed(2)}</span>
              <span className="text-sm font-medium text-slate-500 font-mono">de B/. {budgets.Supermercado.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getProgress(spentSupermercado, budgets.Supermercado)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">No utilizado:</span>
              <span className="text-sm font-semibold text-emerald-600 font-mono">B/. {(budgets.Supermercado - spentSupermercado).toFixed(2)} disponible</span>
            </div>
          </div>
        </div>

        {/* Gasolina */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-slate-100">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Gasolina</h2>
                <p className="text-xs text-slate-500">Presupuesto mensual</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {Math.round(getProgress(spentGasolina, budgets.Gasolina))}% usado
            </span>
          </div>
          <div className="space-y-3 mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">-B/. {spentGasolina.toFixed(2)}</span>
              <span className="text-sm font-medium text-slate-500 font-mono">de B/. {budgets.Gasolina.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getProgress(spentGasolina, budgets.Gasolina)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">No utilizado:</span>
              <span className="text-sm font-semibold text-emerald-600 font-mono">B/. {(budgets.Gasolina - spentGasolina).toFixed(2)} disponible</span>
            </div>
          </div>
        </div>

        {/* Varios & Ocio */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-slate-100">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <PartyPopper className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Varios & Ocio</h2>
                <p className="text-xs text-slate-500">Presupuesto mensual</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
              {Math.round(getProgress(spentOcio, budgets.Ocio))}% usado
            </span>
          </div>
          <div className="space-y-3 mt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-500 font-mono tracking-tight">-B/. {spentOcio.toFixed(2)}</span>
              <span className="text-sm font-medium text-slate-500 font-mono">de B/. {budgets.Ocio.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getProgress(spentOcio, budgets.Ocio)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">No utilizado:</span>
              <span className="text-sm font-semibold text-slate-900 font-mono">B/. {(budgets.Ocio - spentOcio).toFixed(2)} disponible</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter Cockpit */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 mb-6 border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full min-w-0">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1">Pagador:</span>
            <button 
              onClick={() => setPersonFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${personFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Todos ({expenses.length})
            </button>
            <button 
              onClick={() => setPersonFilter('cristhian')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${personFilter === 'cristhian' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">CF</span>
              <span>Cristhian Fuentes</span>
            </button>
            <button 
              onClick={() => setPersonFilter('jennifer')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${personFilter === 'jennifer' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">JC</span>
              <span>Jennifer Camaño</span>
            </button>
          </div>
          
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
              placeholder="Buscar por detalle o comercio..." 
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-nowrap scrollbar-none w-full min-w-0">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1 shrink-0">Categoría:</span>
          {['all', 'Alimentación', 'Supermercado', 'Restaurante', 'Ocio', 'Tecnología', 'Gasolina', 'Transporte', 'Salud', 'Otros'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm space-y-4 border border-slate-100 w-full min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gastos recientes</h2>
            <p className="text-sm text-slate-500">Los egresos se muestran con signo negativo y reflejo contable inmediato.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-slate-500">Total filtrado:</span>
            <span className="text-lg font-bold text-rose-500 font-mono">-B/. {totalFiltered.toFixed(2)}</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Detalle / Comercio</th>
                <th className="py-3 px-3">Persona</th>
                <th className="py-3 px-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredExpenses.map((expense) => {
                const formattedDate = new Date(expense.date).toLocaleDateString('es-ES', {
                  year: 'numeric', month: '2-digit', day: '2-digit'
                });
                
                return (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <td className="py-4 px-3 text-slate-500 font-mono">{formattedDate}</td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-900 max-w-xs truncate">{expense.detail}</td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white shadow-sm">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${expense.person.toLowerCase() === 'cristhian' ? 'bg-emerald-600' : 'bg-indigo-500'}`}>
                          {expense.person.toLowerCase() === 'cristhian' ? 'CF' : 'JC'}
                        </span>
                        <span className="text-xs font-medium text-slate-700">{expense.person}</span>
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right font-bold text-rose-500 font-mono">-B/. {expense.amount.toFixed(2)}</td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No se encontraron gastos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDailyExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
