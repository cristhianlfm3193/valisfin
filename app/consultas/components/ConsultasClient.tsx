'use client';

import React, { useState, useMemo } from 'react';
import { UnifiedTransaction } from '@/app/actions/consultas';
import { Search, X, Download, Filter, Columns, Home, ShoppingBag, Zap, Wallet, Car, Target, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface ConsultasClientProps {
  initialTransactions: UnifiedTransaction[];
}

export default function ConsultasClient({ initialTransactions }: ConsultasClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModule, setActiveModule] = useState('Todos');
  const [responsibleFilter, setResponsibleFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('Todas');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Extract unique filter options
  const responsibles = useMemo(() => {
    const resps = new Set<string>();
    initialTransactions.forEach(t => { if (t.responsibleName) resps.add(t.responsibleName); });
    return Array.from(resps).sort();
  }, [initialTransactions]);

  const dates = useMemo(() => {
    const dts = new Set<string>();
    initialTransactions.forEach(t => {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const monthYear = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        dts.add(monthYear);
      }
    });
    return Array.from(dts);
  }, [initialTransactions]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialTransactions.forEach(t => cats.add(t.category));
    return Array.from(cats).sort();
  }, [initialTransactions]);

  // Derived metrics
  const { filtered, totalAuditado, totalIngresos, totalSalidas } = useMemo(() => {
    let result = initialTransactions;

    if (activeModule !== 'Todos') {
      result = result.filter(t => t.module === activeModule);
    }
    if (responsibleFilter !== 'Todos') {
      result = result.filter(t => t.responsibleName === responsibleFilter);
    }
    if (dateFilter !== 'Todas') {
      result = result.filter(t => {
        const d = new Date(t.date);
        return !isNaN(d.getTime()) && d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) === dateFilter;
      });
    }
    if (categoryFilter !== 'Todas') {
      result = result.filter(t => t.category === categoryFilter);
    }
    if (statusFilter !== 'Todos') {
      result = result.filter(t => t.status === (statusFilter === 'Completado' ? 'completed' : 'pending'));
    }
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.concept.toLowerCase().includes(lower) || 
        t.category.toLowerCase().includes(lower) ||
        (t.responsibleName && t.responsibleName.toLowerCase().includes(lower))
      );
    }

    let ingresos = 0;
    let salidas = 0;
    
    result.forEach(t => {
      if (t.type === 'in') ingresos += t.amount;
      else salidas += t.amount;
    });

    return {
      filtered: result,
      totalAuditado: ingresos + salidas, // Maybe absolute sum?
      totalIngresos: ingresos,
      totalSalidas: salidas
    };
  }, [initialTransactions, searchTerm, activeModule, responsibleFilter, dateFilter, categoryFilter, statusFilter]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setActiveModule('Todos');
    setResponsibleFilter('Todos');
    setDateFilter('Todas');
    setCategoryFilter('Todas');
    setStatusFilter('Todos');
  };

  const getModuleStyle = (mod: string) => {
    switch (mod) {
      case 'Hogar & Reparaciones': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Home };
      case 'Gastos Diarios': return { bg: 'bg-rose-100', text: 'text-rose-700', icon: ShoppingBag };
      case 'Pagos Fijos': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Zap };
      case 'Ingresos': return { bg: 'bg-brand-100', text: 'text-brand-700', icon: Wallet };
      case 'Vehículos': return { bg: 'bg-slate-200', text: 'text-slate-700', icon: Car };
      case 'Metas Familiares': return { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Target };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', icon: Filter };
    }
  };

  // Module Counts
  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Todos': initialTransactions.length,
      'Gastos Diarios': 0,
      'Pagos Fijos': 0,
      'Hogar & Reparaciones': 0,
      'Vehículos': 0,
      'Ingresos': 0,
      'Metas Familiares': 0,
    };
    initialTransactions.forEach(t => {
      if (counts[t.module] !== undefined) counts[t.module]++;
    });
    return counts;
  }, [initialTransactions]);

  const modulesList = ['Todos', 'Gastos Diarios', 'Pagos Fijos', 'Hogar & Reparaciones', 'Vehículos', 'Ingresos', 'Metas Familiares'];

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 lg:space-y-8 pb-10">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-purpose="page-title-banner">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span className="text-[11px] font-extrabold tracking-wider text-brand-700 uppercase">Búsqueda Cruzada y Auditoría Patrimonial</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Consultas & Reportes</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Explora y audita movimientos cruzados entre Gastos, Pagos, Hogar, Vehículos e Ingresos con filtros predictivos de alto rendimiento.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-bold shadow-md hover:bg-brand-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Download className="w-4 h-4" />
            <span>Descargar Reporte</span>
          </button>
        </div>
      </section>

      {/* SEARCH & FILTERING BARRIERS */}
      <div className="flex flex-col gap-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        
        {/* Omni-Search Bar */}
        <div className="relative flex items-center w-full">
          <Search className="absolute left-4 text-slate-400 w-5 h-5" />
          <input 
            className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500 transition-all" 
            placeholder="Buscar por concepto, categoría, responsable..." 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors" 
              title="Borrar búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Module Segmented Chips */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {modulesList.map(mod => (
            <button 
              key={mod}
              onClick={() => setActiveModule(mod)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                activeModule === mod 
                  ? 'bg-brand-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{mod}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeModule === mod ? 'bg-brand-700/50 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {moduleCounts[mod] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Responsable</label>
            <select 
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="Todos">Todos los Cónyuges</option>
              {responsibles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Temporalidad</label>
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer text-transform: capitalize"
            >
              <option value="Todas">Todas las Fechas</option>
              {dates.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="Todas">Todas las Categorías</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estatus</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="Todos">Todos los Estatus</option>
              <option value="Completado">Completado / Recibido</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors border border-slate-200"
            >
              <span>Restablecer Filtros</span>
            </button>
          </div>

        </div>
      </div>

      {/* ANALYTICAL BENTO SUMMARY TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Tile 1: Total Auditado */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Auditado (Monto Absoluto)</span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">B/. {formatCurrency(totalAuditado)}</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="font-semibold text-brand-600">{filtered.length} movimientos</span>
              <span className="text-slate-400">• en esta vista</span>
            </div>
          </div>
        </div>

        {/* Tile 2: Total Salidas */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salidas Totales</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">-B/. {formatCurrency(totalSalidas)}</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              Gastos, Pagos, Hogar, Vehículos y Metas
            </div>
          </div>
        </div>

        {/* Tile 3: Ingresos Totales */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Totales</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-brand-600 tracking-tight">B/. {formatCurrency(totalIngresos)}</span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              Salarios y Asignaciones
            </div>
          </div>
        </div>

      </div>

      {/* RESULTS SECTION: DESKTOP TABLE & MOBILE CARDS */}
      <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        
        {/* Table Header Context */}
        <div className="p-5 flex items-center justify-between flex-wrap gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Resultados Multi-Módulo</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500 font-bold border border-slate-200">
              {filtered.length} registros
            </span>
          </div>
        </div>

        {/* DESKTOP INTERACTIVE TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">Origen / Módulo</th>
                <th className="py-3.5 px-5">Fecha</th>
                <th className="py-3.5 px-5">Detalle / Concepto</th>
                <th className="py-3.5 px-5">Responsable</th>
                <th className="py-3.5 px-5">Categoría</th>
                <th className="py-3.5 px-5 text-right">Monto</th>
                <th className="py-3.5 px-5 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filtered.map(t => {
                const modStyle = getModuleStyle(t.module);
                const ModuleIcon = modStyle.icon;
                const d = new Date(t.date);
                const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
                
                return (
                  <tr key={t.id + t.module} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-white/50 ${modStyle.bg} ${modStyle.text}`}>
                        <ModuleIcon className="w-3.5 h-3.5" />
                        {t.module}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-slate-500 font-semibold whitespace-nowrap">{dateStr}</td>
                    <td className="py-4 px-5 font-bold text-slate-900">{t.concept}</td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {t.responsibleName !== 'Desconocido' ? (
                          <>
                            <span className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-sm ${t.responsibleName === 'Cristhian' ? 'bg-brand-600' : t.responsibleName === 'Jennifer' ? 'bg-teal-600' : 'bg-slate-400'}`}>
                              {t.responsibleName?.substring(0, 2).toUpperCase() || 'NA'}
                            </span>
                            <span className="font-semibold">{t.responsibleName}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-500">{t.category}</td>
                    <td className={`py-4 px-5 text-right font-mono font-bold whitespace-nowrap ${t.type === 'in' ? 'text-brand-600' : 'text-rose-600'}`}>
                      {t.type === 'in' ? '+' : '-'}B/. {formatCurrency(t.amount)}
                    </td>
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        t.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {t.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron registros para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {filtered.map(t => {
            const modStyle = getModuleStyle(t.module);
            const ModuleIcon = modStyle.icon;
            const d = new Date(t.date);
            const dateStr = !isNaN(d.getTime()) ? d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
            
            return (
              <div key={t.id + t.module} className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${modStyle.bg} ${modStyle.text}`}>
                    <ModuleIcon className="w-3.5 h-3.5" />
                    {t.module}
                  </span>
                  <span className={`font-mono font-bold text-lg ${t.type === 'in' ? 'text-brand-600' : 'text-rose-600'}`}>
                    {t.type === 'in' ? '+' : '-'}B/. {formatCurrency(t.amount)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-snug">{t.concept}</p>
                  <span className="text-xs font-semibold text-slate-400">{t.category} • {dateStr}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">{t.responsibleName}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {t.status === 'completed' ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              No se encontraron registros.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
