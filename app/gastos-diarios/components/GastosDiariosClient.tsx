'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { DailyExpense, deleteDailyExpense } from '@/app/actions/daily_expenses';
import { Wallet, SlidersHorizontal, PlusCircle, ShoppingCart, Fuel, PartyPopper, Search, ChevronLeft, ChevronRight, Calendar, Zap, Edit2, Trash2, Utensils, CreditCard, Maximize2, Minimize2 } from 'lucide-react';
import { AddDailyExpenseModal } from './AddDailyExpenseModal';
import { EditDailyExpenseModal } from './EditDailyExpenseModal';
import { Btn3D } from '@/app/components/Btn3D';

interface GastosDiariosClientProps {
  initialExpenses: DailyExpense[];
  fixedPayments?: any[];
}

export function GastosDiariosClient({ initialExpenses, fixedPayments = [] }: GastosDiariosClientProps) {
  const expenses = initialExpenses;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<DailyExpense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'credit_card' | 'cash'>('all');
  const [showAllRows, setShowAllRows] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [isPending, startTransition] = useTransition();
  const ITEMS_PER_PAGE = 10;

  // Resetea a la página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, personFilter, paymentMethodFilter, selectedMonth]);

  // Dynamic budgets from fixedPayments
  const budgets = useMemo(() => {
    const getLimit = (title: string, defaultLimit: number) => {
      const match = fixedPayments.find((p: any) => p.title === title);
      return match ? match.amount : defaultLimit;
    };
    return {
      Supermercado: getLimit('Supermercado', 200),
      Gasolina: getLimit('Gasolina', 200),
      Ocio: 150, // Not tied to fixed payments right now
      Restaurante: 100 // Default budget, can be tied if needed
    };
  }, [fixedPayments]);

  // Calculate budgets for the selected month
  const currentMonthExpenses = expenses.filter(e => {
    return e.date.startsWith(selectedMonth);
  });

  // Calculate spent amounts per budget category
  // Assuming "Alimentación" and "Supermercado" group together for Supermercado budget?
  // Let's use strict match for now, or group them logically.
  const spentSupermercado = currentMonthExpenses
    .filter(e => e.category === 'Supermercado' || e.category === 'Alimentación' || e.category === 'Super Reposición')
    .reduce((sum, e) => sum + e.amount, 0);

  const spentGasolina = currentMonthExpenses
    .filter(e => e.category === 'Gasolina' || e.category === 'Transporte')
    .reduce((sum, e) => sum + e.amount, 0);

  const spentOcio = currentMonthExpenses
    .filter(e => e.category === 'Ocio')
    .reduce((sum, e) => sum + e.amount, 0);

  const spentRestaurante = currentMonthExpenses
    .filter(e => e.category === 'Restaurante')
    .reduce((sum, e) => sum + e.amount, 0);

  const getProgress = (spent: number, total: number) => {
    const pct = (spent / total) * 100;
    return Math.min(Math.max(pct, 0), 100);
  };

  const creditCardCount = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(selectedMonth) && e.is_credit_card).length;
  }, [expenses, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      // 0. Month Filter
      if (!e.date.startsWith(selectedMonth)) {
        return false;
      }
      
      // 1. Search Query (supports commerce, category, subcategory and credit card keywords)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const isCardSearch = ['tarjeta', 'credito', 'crédito', 'tc', 'card', 'visa'].some(k => q.includes(k));
        const matchesDetail = e.detail.toLowerCase().includes(q);
        const matchesCategory = e.category.toLowerCase().includes(q);
        const matchesSubCategory = e.sub_category ? e.sub_category.toLowerCase().includes(q) : false;
        const matchesCard = isCardSearch && Boolean(e.is_credit_card);

        if (!matchesDetail && !matchesCategory && !matchesSubCategory && !matchesCard) {
          return false;
        }
      }
      
      // 2. Category Filter
      if (categoryFilter !== 'all' && e.category !== categoryFilter) {
        return false;
      }
      
      // 3. Person Filter
      if (personFilter !== 'all') {
        const firstName = e.profiles?.first_name?.toLowerCase() || '';
        if (personFilter === 'cristhian' && !firstName.includes('cristhian')) return false;
        if (personFilter === 'jennifer' && !firstName.includes('jennifer')) return false;
      }

      // 4. Payment Method Filter (Tarjeta de crédito / Efectivo)
      if (paymentMethodFilter === 'credit_card' && !e.is_credit_card) return false;
      if (paymentMethodFilter === 'cash' && e.is_credit_card) return false;
      
      return true;
    });
  }, [expenses, selectedMonth, searchQuery, categoryFilter, personFilter, paymentMethodFilter]);

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      startTransition(async () => {
        const res = await deleteDailyExpense(id);
        if (res?.success === false) {
          alert('Error al eliminar el gasto.');
        }
      });
    }
  };

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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gastos Diarios</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              onClick={(e) => {
                try {
                  if ('showPicker' in HTMLInputElement.prototype) {
                    e.currentTarget.showPicker();
                  }
                } catch (err) {}
              }}
              className="pl-9 pr-3 py-2 bg-[#121c27] border border-white/10 rounded-full text-sm font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-sm hover:bg-white/5"
            />
          </div>
          <button className="sm:hidden flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-100 text-slate-300 font-semibold text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <Btn3D 
            onClick={() => setIsModalOpen(true)}
            color="emerald"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Registrar gasto</span>
          </Btn3D>
        </div>
      </div>

      {/* Bento Trio: Dynamic Budget Tracking Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
        
        {/* Supermercado */}
        <div className="bg-[#121c27] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-white/5">
          <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base lg:text-lg font-bold text-white leading-tight truncate">Supermercado</h2>
                <p className="text-[10px] lg:text-xs text-slate-400 truncate">Presupuesto mensual</p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-semibold bg-white/10 text-slate-300">
              {Math.round(getProgress(spentSupermercado, budgets.Supermercado))}% usado
            </span>
          </div>
          <div className="space-y-3 mt-1">
            <div className="flex flex-wrap items-baseline gap-1 lg:gap-2">
              <span className="text-lg lg:text-xl xl:text-2xl font-bold text-rose-500 font-mono tracking-tight">B/. {spentSupermercado.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <span className="text-[10px] lg:text-xs xl:text-sm font-medium text-slate-400 font-mono">de B/. {budgets.Supermercado.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 lg:h-2.5 overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getProgress(spentSupermercado, budgets.Supermercado)}%` }}
              ></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
              <span className="text-[10px] lg:text-xs text-slate-400">No utilizado:</span>
              <span className="text-[11px] lg:text-xs xl:text-sm font-semibold text-emerald-400 font-mono truncate">B/. {(budgets.Supermercado - spentSupermercado).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} disp.</span>
            </div>
          </div>
        </div>

        {/* Gasolina */}
        <div className="bg-[#121c27] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-white/5">
          <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Fuel className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base lg:text-lg font-bold text-white leading-tight truncate">Gasolina</h2>
                <p className="text-[10px] lg:text-xs text-slate-400 truncate">Presupuesto mensual</p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-semibold bg-white/10 text-slate-300">
              {Math.round(getProgress(spentGasolina, budgets.Gasolina))}% usado
            </span>
          </div>
          <div className="space-y-3 mt-1">
            <div className="flex flex-wrap items-baseline gap-1 lg:gap-2">
              <span className="text-lg lg:text-xl xl:text-2xl font-bold text-rose-500 font-mono tracking-tight">B/. {spentGasolina.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <span className="text-[10px] lg:text-xs xl:text-sm font-medium text-slate-400 font-mono">de B/. {budgets.Gasolina.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 lg:h-2.5 overflow-hidden flex">
              <div 
                className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getProgress(spentGasolina, budgets.Gasolina)}%` }}
              ></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
              <span className="text-[10px] lg:text-xs text-slate-400">No utilizado:</span>
              <span className="text-[11px] lg:text-xs xl:text-sm font-semibold text-sky-400 font-mono truncate">B/. {(budgets.Gasolina - spentGasolina).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} disp.</span>
            </div>
          </div>
        </div>

        {/* Varios & Ocio */}
        <div className="bg-[#121c27] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-white/5">
          <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <PartyPopper className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base lg:text-lg font-bold text-white leading-tight truncate">Varios & Ocio</h2>
                <p className="text-[10px] lg:text-xs text-slate-400 truncate">Presupuesto mensual</p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-semibold bg-indigo-500/20 text-indigo-300">
              {Math.round(getProgress(spentOcio, budgets.Ocio))}% usado
            </span>
          </div>
          <div className="space-y-3 mt-1">
            <div className="flex flex-wrap items-baseline gap-1 lg:gap-2">
              <span className="text-lg lg:text-xl xl:text-2xl font-bold text-rose-500 font-mono tracking-tight">B/. {spentOcio.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <span className="text-[10px] lg:text-xs xl:text-sm font-medium text-slate-400 font-mono">de B/. {budgets.Ocio.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 lg:h-2.5 overflow-hidden flex">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getProgress(spentOcio, budgets.Ocio)}%` }}
              ></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
              <span className="text-[10px] lg:text-xs text-slate-400">No utilizado:</span>
              <span className="text-[11px] lg:text-xs xl:text-sm font-semibold text-indigo-400 font-mono truncate">B/. {(budgets.Ocio - spentOcio).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} disp.</span>
            </div>
          </div>
        </div>

        {/* Restaurante */}
        <div className="bg-[#121c27] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow border border-white/5">
          <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Utensils className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base lg:text-lg font-bold text-white leading-tight truncate">Restaurante</h2>
                <p className="text-[10px] lg:text-xs text-slate-400 truncate">Presupuesto mensual</p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-semibold bg-orange-500/20 text-orange-300">
              {Math.round(getProgress(spentRestaurante, budgets.Restaurante))}% usado
            </span>
          </div>
          <div className="space-y-3 mt-1">
            <div className="flex flex-wrap items-baseline gap-1 lg:gap-2">
              <span className="text-lg lg:text-xl xl:text-2xl font-bold text-rose-500 font-mono tracking-tight">B/. {spentRestaurante.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <span className="text-[10px] lg:text-xs xl:text-sm font-medium text-slate-400 font-mono">de B/. {budgets.Restaurante.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 lg:h-2.5 overflow-hidden flex">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${getProgress(spentRestaurante, budgets.Restaurante)}%` }}
              ></div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
              <span className="text-[10px] lg:text-xs text-slate-400">No utilizado:</span>
              <span className="text-[11px] lg:text-xs xl:text-sm font-semibold text-orange-400 font-mono truncate">B/. {(budgets.Restaurante - spentRestaurante).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} disp.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter Cockpit */}
      <div className="bg-[#121c27] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 mb-6 border border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full min-w-0">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1">Pagador:</span>
            <button 
              onClick={() => setPersonFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${personFilter === 'all' ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 border-white/10'}`}
            >
              Todos ({expenses.length})
            </button>
            <button 
              onClick={() => setPersonFilter('cristhian')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap border ${personFilter === 'cristhian' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10 border-white/10'}`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">CF</span>
              <span>Cristhian Fuentes</span>
            </button>
            <button 
              onClick={() => setPersonFilter('jennifer')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap border ${personFilter === 'jennifer' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10 border-white/10'}`}
            >
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${personFilter === 'jennifer' ? 'bg-[#121c27] text-pink-600' : 'bg-pink-500 text-white'}`}>JC</span>
              <span>Jennifer Camaño</span>
            </button>
          </div>
          
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
              placeholder="Buscar por detalle, comercio o tarjeta..." 
              type="text"
            />
          </div>
        </div>

        {/* Método de Pago (Tarjeta de Crédito / Efectivo) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-nowrap scrollbar-none w-full min-w-0">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1 shrink-0">Método de pago:</span>
          <button
            onClick={() => setPaymentMethodFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
              paymentMethodFilter === 'all'
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 border-white/10'
            }`}
          >
            Todos los métodos
          </button>
          <button
            onClick={() => setPaymentMethodFilter(paymentMethodFilter === 'credit_card' ? 'all' : 'credit_card')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
              paymentMethodFilter === 'credit_card'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-white/5 text-slate-400 hover:text-amber-300 hover:bg-white/10 border-white/10'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tarjeta de Crédito ({creditCardCount})</span>
          </button>
        </div>

        {/* Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-nowrap scrollbar-none w-full min-w-0">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1 shrink-0">Categoría:</span>
          {[
            'all',
            'Supermercado',
            'Super Reposición',
            'Restaurante',
            'Ocio',
            'Tecnología',
            'Gasolina',
            'Transporte',
            'Salud',
            'Gastos Valeria (Hija)',
            'Recargas / Telefonía',
            'Servicios Financieros',
            'Intereses de Tarjeta de Crédito',
            'Mantenimiento del Vehículo',
            'Otros'
          ].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border-white/10'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-[#121c27] rounded-3xl p-5 sm:p-7 shadow-sm space-y-4 border border-white/5 w-full min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Gastos recientes</h2>
            <p className="text-sm text-slate-500">Los egresos se muestran con signo negativo y reflejo contable inmediato.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setShowAllRows(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors shadow-sm cursor-pointer"
              title={showAllRows ? "Volver a vista paginada (10 por página)" : "Ver toda la tabla de gastos recientes completa"}
            >
              {showAllRows ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ver paginado (10)</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ver toda la tabla ({filteredExpenses.length})</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Total filtrado:</span>
              <span className="text-lg font-bold text-rose-500 font-mono">B/. {totalFiltered.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-white/5">
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Detalle / Comercio</th>
                <th className="py-3 px-3">Persona</th>
                <th className="py-3 px-3 text-right">Monto</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {(showAllRows 
                ? filteredExpenses 
                : filteredExpenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              ).map((expense) => {
                const formattedDate = new Date(expense.date).toLocaleDateString('es-ES', {
                  year: 'numeric', month: '2-digit', day: '2-digit'
                });
                
                return (
                  <tr key={expense.id} className="hover:bg-white/5 transition-colors border-b border-slate-50/10 last:border-0">
                    <td className="py-4 px-3 text-slate-400 font-mono">{formattedDate}</td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
                        {expense.category}{expense.sub_category ? ` - ${expense.sub_category}` : ''}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-medium text-white max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{expense.detail}</span>
                        {expense.is_credit_card && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <CreditCard className="w-3 h-3" />
                            <span>Tarjeta</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-[#121c27] shadow-sm">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${(expense.profiles?.first_name || '').toLowerCase().includes('cristhian') ? 'bg-emerald-600' : 'bg-pink-500'}`}>
                          {(expense.profiles?.first_name || '').toLowerCase().includes('cristhian') ? 'CF' : 'JC'}
                        </span>
                        <span className="text-xs font-medium text-slate-300">{expense.profiles?.first_name || 'Desconocido'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right font-bold text-rose-500 font-mono">B/. {expense.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="py-4 px-3">
                      <div className="flex justify-end items-center gap-1">
                        <button onClick={() => setEditingExpense(expense)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} disabled={isPending} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No se encontraron gastos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!showAllRows && filteredExpenses.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
            <div className="text-sm text-slate-500">
              Mostrando <span className="font-medium text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredExpenses.length)}</span> de <span className="font-medium text-white">{filteredExpenses.length}</span> gastos
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg text-slate-500 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium text-slate-300">
                Página {currentPage} de {Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE), p + 1))}
                disabled={currentPage === Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)}
                className="p-1 rounded-lg text-slate-500 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {showAllRows && filteredExpenses.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2 text-xs text-slate-500">
            <span>Mostrando todos los <b>{filteredExpenses.length}</b> gastos sin paginación.</span>
            <button
              onClick={() => setShowAllRows(false)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Volver a paginar (10 por página)
            </button>
          </div>
        )}
      </div>

      <AddDailyExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <EditDailyExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
      />
    </>
  );
}
