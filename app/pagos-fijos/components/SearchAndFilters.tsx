'use client';

import { Search, CreditCard } from 'lucide-react';
import Link from 'next/link';

export type FilterType = 'all' | 'pending' | 'paid' | 'credit_card';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentFilter: FilterType;
  setCurrentFilter: (filter: FilterType) => void;
  totalCount: number;
  pendingCount: number;
  paidCount: number;
  creditCardCount?: number;
}

export function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  currentFilter,
  setCurrentFilter,
  totalCount,
  pendingCount,
  paidCount,
  creditCardCount = 0,
}: SearchAndFiltersProps) {
  return (
    <section className="mb-5 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador directo */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-[#121c27] border border-white/10 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow text-white"
            placeholder="Buscar pago fijo, tarjeta, luz, seguro, internet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtros de Estado tipo Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121c27] border border-white/10 rounded-xl shrink-0 overflow-x-auto">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setCurrentFilter('all')}
          >
            Todos ({totalCount})
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              currentFilter === 'pending'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setCurrentFilter('pending')}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              currentFilter === 'paid'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => setCurrentFilter('paid')}
          >
            Pagados ({paidCount})
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap border ${
              currentFilter === 'credit_card'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-amber-300 hover:bg-white/5 border-transparent'
            }`}
            onClick={() => setCurrentFilter(currentFilter === 'credit_card' ? 'all' : 'credit_card')}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tarjeta ({creditCardCount})</span>
          </button>
        </div>
      </div>

    </section>
  );
}
