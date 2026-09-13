'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';

export type FilterType = 'all' | 'pending' | 'paid';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentFilter: FilterType;
  setCurrentFilter: (filter: FilterType) => void;
  totalCount: number;
  pendingCount: number;
  paidCount: number;
}

export function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  currentFilter,
  setCurrentFilter,
  totalCount,
  pendingCount,
  paidCount,
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
            placeholder="Buscar pago fijo: luz, seguro, guardería, internet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtros de Estado tipo Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shrink-0 overflow-x-auto">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              currentFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
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
                : 'text-slate-600 hover:bg-slate-100'
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
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setCurrentFilter('paid')}
          >
            Pagados ({paidCount})
          </button>
        </div>
      </div>

    </section>
  );
}
