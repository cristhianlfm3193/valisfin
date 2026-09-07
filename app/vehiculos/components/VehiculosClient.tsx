'use client';

import { useState, useTransition } from 'react';
import AddKmModal from './AddKmModal';
import AddMaintenanceModal from './AddMaintenanceModal';
import AddPendingModal from './AddPendingModal';
import EditPendingModal from './EditPendingModal';
import EditCompletedModal from './EditCompletedModal';
import { markMaintenanceAsDone, deleteMaintenance, deleteMileageLog, updateMileageLog } from '../../actions/vehicles';
import { Trash2, Edit2, CheckCircle } from 'lucide-react';

export default function VehiculosClient({
  vehicles,
  mileageLogs,
  maintenanceLogs
}: {
  vehicles: any[];
  mileageLogs: any[];
  maintenanceLogs: any[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleEditKm = (id: string, currentKm: number) => {
    const newVal = window.prompt('Editar kilometraje:', currentKm.toString());
    if (newVal !== null) {
      const newKm = parseInt(newVal, 10);
      if (!isNaN(newKm) && newKm > 0) {
        startTransition(async () => {
          await updateMileageLog(id, newKm);
        });
      } else {
        alert('Kilometraje inválido.');
      }
    }
  };

  const handleDeleteKm = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de kilometraje?')) {
      startTransition(async () => {
        await deleteMileageLog(id);
      });
    }
  };

  const [isKmModalOpen, setIsKmModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  
  const [isEditPendingModalOpen, setIsEditPendingModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);

  const [isEditCompletedModalOpen, setIsEditCompletedModalOpen] = useState(false);
  const [completedTaskToEdit, setCompletedTaskToEdit] = useState<any>(null);
  
  const [kmFilter, setKmFilter] = useState('all');
  const [kmPage, setKmPage] = useState(1);
  const [kmPageSize, setKmPageSize] = useState(10);
  
  const [maintFilter, setMaintFilter] = useState('all');
  const [maintPage, setMaintPage] = useState(1);
  const [maintPageSize, setMaintPageSize] = useState(10);
  
  const [pendingFilter, setPendingFilter] = useState('all');
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(10);

  const pendingTasks = maintenanceLogs.filter(log => log.is_pending);
  const completedMaintenance = maintenanceLogs.filter(log => !log.is_pending);

  const filteredPending = pendingFilter === 'all'
    ? pendingTasks
    : pendingTasks.filter(log => log.vehicle_id === pendingFilter);
  const totalPendingPages = Math.max(1, Math.ceil(filteredPending.length / pendingPageSize));
  const paginatedPending = filteredPending.slice((pendingPage - 1) * pendingPageSize, pendingPage * pendingPageSize);
  
  const totalPendingFilteredCost = filteredPending.reduce((sum, task) => sum + (task.cost || 0), 0);

  const handleMarkDone = async (id: string) => {
    if (confirm('¿Marcar este trabajo como realizado? Se moverá al historial.')) {
      await markMaintenanceAsDone(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar permanentemente este trabajo de los registros?')) {
      await deleteMaintenance(id);
    }
  };

  const handleEdit = (task: any) => {
    setTaskToEdit(task);
    setIsEditPendingModalOpen(true);
  };

  const handleEditCompleted = (task: any) => {
    setCompletedTaskToEdit(task);
    setIsEditCompletedModalOpen(true);
  };

  const filteredMileage = kmFilter === 'all' 
    ? mileageLogs 
    : mileageLogs.filter(log => log.vehicle_id === kmFilter);
  const totalKmPages = Math.max(1, Math.ceil(filteredMileage.length / kmPageSize));
  const paginatedMileage = filteredMileage.slice((kmPage - 1) * kmPageSize, kmPage * kmPageSize);

  const filteredMaintenance = maintFilter === 'all'
    ? completedMaintenance
    : completedMaintenance.filter(log => log.vehicle_id === maintFilter);
  const totalMaintPages = Math.max(1, Math.ceil(filteredMaintenance.length / maintPageSize));
  const paginatedMaintenance = filteredMaintenance.slice((maintPage - 1) * maintPageSize, maintPage * maintPageSize);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* CABECERA SUPERIOR */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#006655]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#006655]">
                Egresos y control automotriz en tiempo real
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              Vehículos y Mantenimiento
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setIsKmModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006655] hover:bg-[#005144] text-white font-semibold text-sm shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">speed</span>
              <span>+ Kilometraje</span>
            </button>
            <button 
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006655] hover:bg-[#005144] text-white font-semibold text-sm shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span>Registrar Mantenimiento</span>
            </button>
            <button 
              onClick={() => setIsPendingModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-orange-600">assignment_late</span>
              <span>Trabajo Pendiente</span>
            </button>
          </div>
        </header>

        {/* FICHAS BENTO PRINCIPALES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map(vehicle => {
            const latestMaintenance = completedMaintenance.find(log => log.vehicle_id === vehicle.id && log.next_km);
            const next_service_km = latestMaintenance?.next_km || null;
            
            const isOverdue = next_service_km && (vehicle.current_km > next_service_km);
            const isWarning = next_service_km && !isOverdue && (next_service_km - vehicle.current_km <= 1000);
            
            const remaining = next_service_km ? Math.max(0, next_service_km - vehicle.current_km) : 0;
            const overdueBy = next_service_km && isOverdue ? vehicle.current_km - next_service_km : 0;
            const progress = next_service_km 
              ? (isOverdue ? 100 : Math.min(100, Math.max(0, 100 - (remaining / 5000) * 100))) 
              : 100;
              
            const isJennifer = vehicle.owner_id === '7b5c62be-58f1-48d6-b366-0f504c39bdcb';
            
            const vehiclePendingTasks = pendingTasks.filter(task => task.vehicle_id === vehicle.id);
            const totalPendingCost = vehiclePendingTasks.reduce((sum, task) => sum + (task.cost || 0), 0);

            const vehicleCompletedTasks = completedMaintenance.filter(task => task.vehicle_id === vehicle.id);
            const totalInvested = vehicleCompletedTasks.reduce((sum, task) => sum + (task.cost || 0), 0);
            
            return (
              <div key={vehicle.id} className={`bg-white rounded-3xl p-6 border border-outline-subtle shadow-card flex flex-col justify-between transition-all relative overflow-hidden ${isOverdue ? 'hover:border-red-400' : (isJennifer ? 'hover:border-pink-300' : 'hover:border-slate-300')}`}>
                {(isWarning || isOverdue) && <div className={`absolute top-0 left-0 right-0 h-1 ${isOverdue ? 'bg-red-500' : (isJennifer ? 'bg-pink-400' : 'bg-amber-400')}`}></div>}
                
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isJennifer ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-emerald-50 text-[#006655] border-emerald-100'}`}>
                        <span className="material-symbols-outlined text-[26px]">
                          {vehicle.brand === 'Toyota' ? 'directions_car' : 'airport_shuttle'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-on-surface">{vehicle.brand} {vehicle.model}</h2>
                          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">{vehicle.year}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                          <span className="font-semibold text-slate-800">{vehicle.owner_id === 'edc938dc-9fbc-4573-b007-0bdb95114f95' ? 'Cristhian Fuentes' : 'Jennifer Camaño'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-slate-500">Placa: {vehicle.plate}</span>
                        </div>
                      </div>
                    </div>
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                        <span className="material-symbols-outlined text-[15px] text-red-600">dangerous</span>
                        Mantenimiento Vencido
                      </span>
                    ) : isWarning ? (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isJennifer ? 'bg-pink-100 text-pink-800 border border-pink-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                        <span className={`material-symbols-outlined text-[15px] ${isJennifer ? 'text-pink-600' : 'text-amber-600'}`}>warning</span>
                        Atención requerida
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isJennifer ? 'bg-pink-100/80 text-pink-600' : 'bg-emerald-100/80 text-[#006655]'}`}>
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Al día · En regla
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kilometraje actual</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-slate-400">update</span>
                        Última lectura: <strong className="text-slate-700 font-semibold">{vehicle.km_date}</strong>
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
                        {vehicle.current_km?.toLocaleString()}
                      </span>
                      <span className={`font-mono text-lg font-bold ${isJennifer ? 'text-pink-600' : 'text-[#006655]'}`}>km</span>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600">Próximo servicio: <strong className="font-mono text-slate-900 font-semibold">{next_service_km?.toLocaleString() || 'N/A'} km</strong></span>
                        <span className={`${isOverdue ? 'text-red-600' : (isJennifer ? 'text-pink-600' : 'text-[#006655]')} font-semibold font-mono`}>
                          {isOverdue ? `Pasado por ${overdueBy.toLocaleString()} km` : next_service_km ? `Faltan ${remaining.toLocaleString()} km` : 'Sin programar'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className={`${isOverdue ? 'bg-red-500' : (isJennifer ? 'bg-pink-500' : 'bg-[#006655]')} h-full rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                      </div>
                      
                      {isOverdue && (
                        <div className={`mt-2.5 px-2.5 py-1.5 rounded-lg border flex items-start gap-1.5 text-xs bg-red-50 border-red-200 text-red-800`}>
                          <span className={`material-symbols-outlined text-[16px] text-red-600 mt-0.5`}>warning</span>
                          <span><strong>¡Peligro Crítico!</strong> Te has pasado por {overdueBy.toLocaleString()} km. Programa el mantenimiento urgente porque el motor podría sufrir daños severos y costar mucho dinero.</span>
                        </div>
                      )}
                      
                      {isWarning && (
                        <div className={`mt-2.5 px-2.5 py-1.5 rounded-lg border flex items-start gap-1.5 text-xs ${isJennifer ? 'bg-pink-50 border-pink-200/70 text-pink-800' : 'bg-amber-50 border-amber-200/70 text-amber-800'}`}>
                          <span className={`material-symbols-outlined text-[16px] ${isJennifer ? 'text-pink-600' : 'text-amber-600'} mt-0.5`}>error</span>
                          <span><strong>¡Atención!</strong> Faltan {remaining.toLocaleString()} km para mantenimiento.</span>
                        </div>
                      )}

                      <div className={`mt-3 px-3 py-2.5 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${isJennifer ? 'bg-pink-50/50 border-pink-100' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-[18px] ${isJennifer ? 'text-pink-500' : 'text-slate-500'}`}>payments</span>
                          <span className={`font-semibold ${isJennifer ? 'text-pink-700' : 'text-slate-700'}`}>Inversión Histórica</span>
                        </div>
                        <span className={`font-mono font-bold text-base ${isJennifer ? 'text-pink-600' : 'text-slate-600'}`}>B/. {totalInvested.toFixed(2)}</span>
                      </div>

                      {vehiclePendingTasks.length > 0 && (
                        <div className={`mt-2 px-3 py-2.5 rounded-xl border flex items-center justify-between text-sm shadow-sm transition-all ${isJennifer ? 'bg-pink-50 border-pink-200' : 'bg-emerald-50 border-emerald-200'}`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`material-symbols-outlined text-[18px] ${isJennifer ? 'text-pink-600' : 'text-[#006655]'}`}>account_balance_wallet</span>
                            <span className={`font-semibold ${isJennifer ? 'text-pink-800' : 'text-emerald-800'}`}>Presupuesto Pendiente</span>
                          </div>
                          <span className={`font-mono font-bold text-base ${isJennifer ? 'text-pink-700' : 'text-[#006655]'}`}>B/. {totalPendingCost.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* LECTURAS DE KILOMETRAJE */}
        <section className="bg-white rounded-3xl p-6 border border-outline-subtle shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006655] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">speed</span>
                </div>
                <h2 className="text-lg font-bold text-on-surface">Lecturas de Kilometraje</h2>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold">
              <button onClick={() => { setKmFilter('all'); setKmPage(1); }} className={`px-3 py-1 rounded-full transition-all ${kmFilter === 'all' ? 'bg-white text-on-surface shadow-sm' : 'text-slate-600'}`}>Todos</button>
              {vehicles.map(v => (
                <button key={v.id} onClick={() => { setKmFilter(v.id); setKmPage(1); }} className={`px-3 py-1 rounded-full transition-all ${kmFilter === v.id ? 'bg-white text-on-surface shadow-sm' : 'text-slate-600'}`}>
                  {v.brand} {v.model}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 font-semibold">
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Vehículo</th>
                  <th className="py-3 px-3 font-mono">Kilometraje</th>
                  <th className="py-3 px-3 text-right">Registrado Por</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedMileage.map(log => {
                  const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                  const isJennifer = vehicle?.owner_id === '7b5c62be-58f1-48d6-b366-0f504c39bdcb';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-slate-500 text-xs">{log.date}</td>
                      <td className="py-3.5 px-3 font-semibold text-on-surface">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isJennifer ? 'bg-pink-500' : 'bg-[#006655]'}`}></span>
                          <span>{vehicle?.brand} {vehicle?.model}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{log.km?.toLocaleString()} km</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-700 font-medium">
                          {log.user_id === 'edc938dc-9fbc-4573-b007-0bdb95114f95' ? 'Cristhian Fuentes' : 'Jennifer Camaño'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            disabled={isPending}
                            onClick={() => handleEditKm(log.id, log.km)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={isPending}
                            onClick={() => handleDeleteKm(log.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Mostrar:</span>
              <select 
                value={kmPageSize} 
                onChange={(e) => { setKmPageSize(Number(e.target.value)); setKmPage(1); }}
                className="text-xs border-slate-200 rounded-md py-1 px-2 text-slate-600 bg-white cursor-pointer hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-[#006655] outline-none"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={1000}>Todos</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setKmPage(p => Math.max(1, p - 1))}
                disabled={kmPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                Anterior
              </button>
              <span className="text-xs font-medium text-slate-500">
                Página {kmPage} de {totalKmPages}
              </span>
              <button 
                onClick={() => setKmPage(p => Math.min(totalKmPages, p + 1))}
                disabled={kmPage === totalKmPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                Siguiente
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* TAREAS PENDIENTES */}
        {pendingTasks.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border border-orange-200 shadow-card space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-400"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">assignment_late</span>
                  </div>
                  <h2 className="text-lg font-bold text-on-surface">Trabajos Pendientes de Revisión</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                  {filteredPending.length} Tareas Críticas
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Total: B/. {totalPendingFilteredCost.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold">
                  <button onClick={() => { setPendingFilter('all'); setPendingPage(1); }} className={`px-3 py-1 rounded-full transition-all ${pendingFilter === 'all' ? 'bg-white text-on-surface shadow-sm' : 'text-slate-600'}`}>Todos</button>
                  {vehicles.map(v => (
                    <button key={v.id} onClick={() => { setPendingFilter(v.id); setPendingPage(1); }} className={`px-3 py-1 rounded-full transition-all ${pendingFilter === v.id ? 'bg-white text-on-surface shadow-sm' : 'text-slate-600'}`}>
                      {v.brand} {v.model}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 font-semibold">
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3">Vehículo</th>
                    <th className="py-3 px-3">Trabajo a Realizar</th>
                    <th className="py-3 px-3 font-mono">Registrado en</th>
                    <th className="py-3 px-3 font-mono text-right">Presupuesto (B/.)</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 text-sm">
                  {paginatedPending.map(task => {
                    const vehicle = vehicles.find(v => v.id === task.vehicle_id);
                    return (
                      <tr key={task.id} className="hover:bg-orange-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-mono text-slate-500 text-xs">{task.date}</td>
                        <td className="py-3.5 px-3 font-semibold text-on-surface text-orange-700">{vehicle?.brand} {vehicle?.model}</td>
                        <td className="py-3.5 px-3 font-medium text-slate-800">
                          {task.service}
                          {task.notes && <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] truncate" title={task.notes}>{task.notes}</p>}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">
                          {task.km?.toLocaleString() || 0} km
                          {vehicle && task.km && vehicle.current_km > task.km ? (
                            <span className="block text-[10px] text-red-500 font-bold mt-0.5" title="Kilómetros recorridos desde que se recomendó">
                              +{ (vehicle.current_km - task.km).toLocaleString() } km
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-right text-slate-700">
                          {task.cost ? `B/. ${task.cost.toFixed(2)}` : <span className="text-xs font-normal text-slate-400">Sin presupuesto</span>}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => handleMarkDone(task.id)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Marcar como Realizado"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(task)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">Mostrar:</span>
                <select 
                  value={pendingPageSize} 
                  onChange={(e) => { setPendingPageSize(Number(e.target.value)); setPendingPage(1); }}
                  className="text-xs border-slate-200 rounded-md py-1 px-2 text-slate-600 bg-white cursor-pointer hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-[#006655] outline-none"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={1000}>Todos</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                  disabled={pendingPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  Anterior
                </button>
                <span className="text-xs font-medium text-slate-500">
                  Página {pendingPage} de {totalPendingPages}
                </span>
                <button 
                  onClick={() => setPendingPage(p => Math.min(totalPendingPages, p + 1))}
                  disabled={pendingPage === totalPendingPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-1"
                >
                  Siguiente
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* HISTORIAL MANTENIMIENTO */}
        <section className="bg-white rounded-3xl p-6 border border-outline-subtle shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006655] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">build_circle</span>
                </div>
                <h2 className="text-lg font-bold text-on-surface">Historial de Mantenimientos Realizados</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                {filteredMaintenance.length} Servicios
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold">
                <button onClick={() => { setMaintFilter('all'); setMaintPage(1); }} className={`px-3 py-1 rounded-full transition-all ${maintFilter === 'all' ? 'bg-white text-on-surface shadow-sm' : 'text-slate-600'}`}>Todos</button>
                {vehicles.map(v => (
                  <button key={v.id} onClick={() => { setMaintFilter(v.id); setMaintPage(1); }} className={`px-3 py-1 rounded-full transition-all ${maintFilter === v.id ? 'bg-white text-on-surface shadow-sm' : 'text-slate-600'}`}>
                    {v.brand} {v.model}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 font-semibold">
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Vehículo</th>
                  <th className="py-3 px-3">Servicio</th>
                  <th className="py-3 px-3 font-mono">Kilometraje</th>
                  <th className="py-3 px-3 font-mono text-right">Costo (B/.)</th>
                  <th className="py-3 px-3 text-right">Taller</th>
                  <th className="py-3 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedMaintenance.map(log => {
                  const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-slate-500 text-xs">{log.date}</td>
                      <td className="py-3.5 px-3 font-semibold text-on-surface">{vehicle?.brand} {vehicle?.model}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-800">
                        {log.service}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{log.km?.toLocaleString()} km</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-right text-slate-700">B/. {log.cost?.toFixed(2) || '0.00'}</td>
                      <td className="py-3.5 px-3 text-right text-xs text-slate-600 font-medium">{log.shop || 'N/A'}</td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleEditCompleted(log)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar mantenimiento"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(log.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Mostrar:</span>
              <select 
                value={maintPageSize} 
                onChange={(e) => { setMaintPageSize(Number(e.target.value)); setMaintPage(1); }}
                className="text-xs border-slate-200 rounded-md py-1 px-2 text-slate-600 bg-white cursor-pointer hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-[#006655] outline-none"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={1000}>Todos</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMaintPage(p => Math.max(1, p - 1))}
                disabled={maintPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                Anterior
              </button>
              <span className="text-xs font-medium text-slate-500">
                Página {maintPage} de {totalMaintPages}
              </span>
              <button 
                onClick={() => setMaintPage(p => Math.min(totalMaintPages, p + 1))}
                disabled={maintPage === totalMaintPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all flex items-center gap-1"
              >
                Siguiente
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      <AddKmModal 
        isOpen={isKmModalOpen} 
        onClose={() => setIsKmModalOpen(false)} 
        vehicles={vehicles} 
      />
      
      <AddMaintenanceModal 
        isOpen={isMaintenanceModalOpen} 
        onClose={() => setIsMaintenanceModalOpen(false)} 
        vehicles={vehicles} 
      />
      
      <AddPendingModal 
        isOpen={isPendingModalOpen} 
        onClose={() => setIsPendingModalOpen(false)} 
        vehicles={vehicles} 
      />

      <EditPendingModal 
        isOpen={isEditPendingModalOpen}
        onClose={() => { setIsEditPendingModalOpen(false); setTaskToEdit(null); }}
        task={taskToEdit}
      />

      <EditCompletedModal
        isOpen={isEditCompletedModalOpen}
        onClose={() => { setIsEditCompletedModalOpen(false); setCompletedTaskToEdit(null); }}
        task={completedTaskToEdit}
      />
    </div>
  );
}
