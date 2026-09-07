'use client';

import { useState, useMemo } from 'react';
import AddGoalModal from './AddGoalModal';
import EditGoalModal from './EditGoalModal';
import { deleteSavingsGoal } from '@/app/actions/goals';

export default function MetasClient({ goals }: { goals: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGoal, setEditingGoal] = useState<any>(null);

  // KPIs
  const globalTarget = goals.reduce((acc, g) => acc + (g.target_amount || 0), 0);
  const globalSaved = goals.reduce((acc, g) => acc + (g.saved_amount || 0), 0);
  const globalMissing = Math.max(0, globalTarget - globalSaved);
  const globalProgress = globalTarget > 0 ? (globalSaved / globalTarget) * 100 : 0;
  
  const completedCount = goals.filter(g => g.saved_amount >= g.target_amount).length;

  // Filter
  const filteredGoals = useMemo(() => {
    return goals.filter(g => 
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [goals, searchTerm]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta meta?')) {
      await deleteSavingsGoal(id);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'MUY ALTA': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ALTA': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'BAJA': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MEDIA':
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">
        
        {/* Header Section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-purpose="page-title-banner">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-[11px] font-extrabold tracking-wider text-brand-700 uppercase">PRIORIDADES FAMILIARES Y FUTURO</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Metas de Ahorro</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Planificación y seguimiento de compras, mejoras del hogar y objetivos personales.</p>
          </div>
          <AddGoalModal />
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5" data-purpose="bento-kpi-summary">
          {/* KPI 1 */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Meta Global Total</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">B/. {formatCurrency(globalTarget)}</p>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>{goals.length} metas planificadas en total</span>
            </div>
          </article>

          {/* KPI 2 */}
          <article className="bg-white rounded-2xl p-5 border border-brand-200/80 shadow-xs relative overflow-hidden group bg-gradient-to-b from-white to-brand-50/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-800">Total Ahorrado</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 text-brand-800 border border-brand-200">
                {Math.min(100, globalProgress).toFixed(1)}% completado
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-brand-700 tracking-tight">B/. {formatCurrency(globalSaved)}</p>
            <div className="mt-3">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, globalProgress)}%` }}></div>
              </div>
            </div>
          </article>

          {/* KPI 3 */}
          <article className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Falta por Ahorrar</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">B/. {formatCurrency(globalMissing)}</p>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="text-amber-600 font-semibold">{completedCount} metas completadas</span>
              <span>• {goals.length - completedCount} por financiar</span>
            </div>
          </article>
        </section>

        {/* Search */}
        <section className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 text-xs sm:text-sm rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-400 font-medium" 
              placeholder="Buscar meta o proyecto..." 
              type="text"
            />
          </div>
        </section>

        {/* Table */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full max-w-full">
          <div className="hidden lg:block overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5 whitespace-nowrap">Meta / Proyecto</th>
                  <th className="py-4 px-5 whitespace-nowrap">Costo</th>
                  <th className="py-4 px-5 whitespace-nowrap">Ahorrado</th>
                  <th className="py-4 px-5 whitespace-nowrap">Falta</th>
                  <th className="py-4 px-5 whitespace-nowrap">Progreso</th>
                  <th className="py-4 px-5 whitespace-nowrap">Prioridad</th>
                  <th className="py-4 px-5 text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGoals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">No se encontraron metas de ahorro.</td>
                  </tr>
                ) : filteredGoals.map(goal => {
                  const missing = Math.max(0, goal.target_amount - goal.saved_amount);
                  const progress = goal.target_amount > 0 ? Math.min(100, (goal.saved_amount / goal.target_amount) * 100) : 0;
                  
                  return (
                    <tr key={goal.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-900">{goal.title}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            {goal.category} • {goal.profiles?.first_name || 'Desconocido'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-700 whitespace-nowrap">B/. {formatCurrency(goal.target_amount)}</td>
                      <td className="py-4 px-5 font-bold text-brand-700 whitespace-nowrap">B/. {formatCurrency(goal.saved_amount)}</td>
                      <td className="py-4 px-5 font-semibold text-slate-500 whitespace-nowrap">B/. {formatCurrency(missing)}</td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-500">{progress.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(goal.priority)}`}>
                          {goal.priority.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => setEditingGoal(goal)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(goal.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {filteredGoals.map(goal => {
              const missing = Math.max(0, goal.target_amount - goal.saved_amount);
              const progress = goal.target_amount > 0 ? Math.min(100, (goal.saved_amount / goal.target_amount) * 100) : 0;
                  
              return (
                <div key={goal.id} className="p-4 sm:p-5 space-y-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{goal.title}</h3>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">{goal.category}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 w-8">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-bold">Costo</span>
                      <span className="font-semibold text-slate-700">B/.{formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-bold">Ahorrado</span>
                      <span className="font-bold text-brand-700">B/.{formatCurrency(goal.saved_amount)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-bold">Falta</span>
                      <span className="font-semibold text-slate-500">B/.{formatCurrency(missing)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                    <button onClick={() => setEditingGoal(goal)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-brand-50 text-brand-700">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600">
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <EditGoalModal 
        goal={editingGoal} 
        isOpen={!!editingGoal} 
        onClose={() => setEditingGoal(null)} 
      />
    </>
  );
}
