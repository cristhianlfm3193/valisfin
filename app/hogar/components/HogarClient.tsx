'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, PenSquare, Trash2, CheckCircle2, Clock, AlertCircle, Wrench } from 'lucide-react';
import AddHomeTaskModal from './AddHomeTaskModal';
import EditHomeTaskModal from './EditHomeTaskModal';
import ACTracker from './ACTracker';
import { markTaskCompleted, deleteHomeTask } from '@/app/actions/home';

export default function HogarClient({ tasks, acData }: { tasks: any[], acData: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [editingTask, setEditingTask] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Derived metrics
  const pendingTasks = tasks.filter(t => t.status === 'Pendiente' || t.status === 'En Proceso');
  const completedTasks = tasks.filter(t => t.status === 'Completado');
  const urgentTasks = pendingTasks.filter(t => t.priority === 'Alta' || t.priority === 'Urgente');

  const pendingBudget = pendingTasks.reduce((acc, t) => acc + (t.budget || 0), 0);
  const executedBudget = completedTasks.reduce((acc, t) => acc + (t.budget || 0), 0);

  // Próxima revisión (first urgent or high priority)
  const nextRevision = urgentTasks.sort((a, b) => new Date(a.estimated_date || a.registration_date).getTime() - new Date(b.estimated_date || b.registration_date).getTime())[0] || pendingTasks[0];

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'Todos' ||
                            (filter === 'Pendientes' && (t.status === 'Pendiente' || t.status === 'En Proceso')) ||
                            (filter === 'Completados' && t.status === 'Completado') ||
                            (filter === 'Urgentes' && (t.priority === 'Alta' || t.priority === 'Urgente') && t.status !== 'Completado');
                            
      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchTerm, filter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Actions
  const handleComplete = async (id: string) => {
    await markTaskCompleted(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      await deleteHomeTask(id);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <>
      <header className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 lg:pt-8 pb-3 sm:pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
              <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">Mantenimiento, Reparaciones y Mejoras Patrimoniales</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
              Hogar y Mantenimiento
            </h1>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setFilter('Pendientes')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm min-h-[44px]"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Trabajos Pendientes</span>
              <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">{pendingTasks.length}</span>
            </button>
            <AddHomeTaskModal />
          </div>
        </div>
      </header>

      <section aria-label="Tarjetas Resumen Bento" className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Bento Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Presupuesto Estimado Pendiente</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-700 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">B/. {formatCurrency(pendingBudget)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                {pendingTasks.length} trabajos activos
              </span>
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inversión Ejecutada</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">B/. {formatCurrency(executedBudget)}</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{completedTasks.length} mantenimientos finalizados</span>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Próxima Revisión Prioritaria</span>
              {nextRevision?.priority === 'Alta' || nextRevision?.priority === 'Urgente' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                  Urgente
                </span>
              ) : nextRevision ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Planificado
                </span>
              ) : null}
            </div>
            <div className="mt-2.5">
              <p className="text-base font-bold text-slate-800 leading-snug">
                {nextRevision ? nextRevision.title : "Todo al día"}
              </p>
              <p className="text-xs text-slate-500 mt-1">{nextRevision ? `${nextRevision.area} • Programado para ${formatDate(nextRevision.estimated_date || nextRevision.registration_date)}` : "No hay tareas pendientes."}</p>
            </div>
          </div>
        </div>
      </section>

      <ACTracker acData={acData} />

      <main className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 pb-24 md:pb-6 flex-1">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-brand-700 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Trabajos y Reparaciones del Hogar</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 placeholder-slate-400 focus:ring-emerald-600 focus:border-emerald-600 w-full sm:w-64 min-h-[40px]" 
                  placeholder="Buscar por área o trabajo..." 
                />
              </div>
              
              <div className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 gap-1">
                {['Todos', 'Pendientes', 'Completados', 'Urgentes'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg text-xs transition-all ${filter === f ? 'bg-[#09574a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
                  >
                    <span>{f}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-5">Fechas</th>
                  <th className="py-3 px-5">Detalle del Trabajo</th>
                  <th className="py-3 px-5 text-center">Estado / Prioridad</th>
                  <th className="py-3 px-5 text-right">Presupuesto</th>
                  <th className="py-3 px-5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedTasks.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500">No hay tareas para mostrar.</td></tr>
                ) : paginatedTasks.map(task => (
                  <tr key={task.id} className={`hover:bg-slate-50/70 transition-colors ${task.status === 'Completado' ? 'bg-emerald-50/20' : ''}`}>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Reg: {formatDate(task.registration_date)}</span>
                        {task.status === 'Completado' ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Fin: {formatDate(task.completion_date)}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold w-fit">
                            <Clock className="w-3 h-3" />
                            <span>Est: {formatDate(task.estimated_date)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          {task.area}
                        </span>
                        <span className="font-bold text-slate-800">{task.title}</span>
                        {task.description && <span className="text-[11px] font-normal text-slate-500 line-clamp-1">{task.description}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1.5">
                        {task.status === 'Completado' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-300">✓ Resuelto</span>
                        ) : task.priority === 'Alta' || task.priority === 'Urgente' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Alta / {task.status}</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Media / {task.status}</span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                          (task.profiles?.first_name || '').toLowerCase().includes('jennifer') ? 'bg-pink-50 text-pink-700 border-pink-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {task.profiles?.first_name || 'Desconocido'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <span className="font-extrabold text-slate-900 block">B/. {formatCurrency(task.budget || 0)}</span>
                    </td>
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {task.status !== 'Completado' && (
                          <button onClick={() => handleComplete(task.id)} className="w-8 h-8 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors shadow-sm" title="Marcar como cumplido">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setEditingTask(task)} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm" title="Editar trabajo">
                          <PenSquare className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm" title="Eliminar registro">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile view omitted for brevity, but should be mapped similarly */}
          <div className="block md:hidden divide-y divide-slate-100">
             {paginatedTasks.length === 0 ? (
               <div className="py-8 text-center text-slate-500 text-xs">No hay tareas para mostrar.</div>
             ) : paginatedTasks.map(task => (
                <div key={task.id} className={`p-4 hover:bg-slate-50/70 transition-colors space-y-3 ${task.status === 'Completado' ? 'bg-emerald-50/20' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                      <span>{task.area}</span>
                    </div>
                    {task.status === 'Completado' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-300">✓ Resuelto</span>
                    ) : task.priority === 'Alta' || task.priority === 'Urgente' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Alta / {task.status}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Media / {task.status}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 leading-snug">{task.title}</h3>
                    {task.description && <p className="text-[11px] font-normal text-slate-400 mt-0.5 truncate">{task.description}</p>}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>Reg: {formatDate(task.registration_date)}</span>
                    </div>
                    <span className="font-bold text-slate-900">B/. {formatCurrency(task.budget || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                      (task.profiles?.first_name || '').toLowerCase().includes('jennifer') ? 'bg-pink-50 text-pink-700 border-pink-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>{task.profiles?.first_name || 'Desconocido'}</span>
                    <div className="flex items-center gap-2">
                      {task.status !== 'Completado' && (
                        <button onClick={() => handleComplete(task.id)} className="h-9 px-3 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors">
                          <CheckCircle2 className="w-4 h-4" /> Cumplir
                        </button>
                      )}
                      <button onClick={() => setEditingTask(task)} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors">
                        <PenSquare className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(task.id)} className="w-9 h-9 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
             ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} de {filteredTasks.length}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Anterior
                </button>
                <div className="flex items-center px-2">
                  <span className="text-xs font-bold text-slate-700">
                    {currentPage} / {totalPages}
                  </span>
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <EditHomeTaskModal 
        task={editingTask} 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)} 
      />
    </>
  );
}
