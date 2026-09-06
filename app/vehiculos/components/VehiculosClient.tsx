'use client';

import { useState } from 'react';
import AddKmModal from './AddKmModal';
import AddMaintenanceModal from './AddMaintenanceModal';

export default function VehiculosClient({
  vehicles,
  mileageLogs,
  maintenanceLogs
}: {
  vehicles: any[];
  mileageLogs: any[];
  maintenanceLogs: any[];
}) {
  const [isKmModalOpen, setIsKmModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [kmFilter, setKmFilter] = useState('all');

  const filteredMileage = kmFilter === 'all' 
    ? mileageLogs 
    : mileageLogs.filter(log => log.vehicle_id === kmFilter);

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
              <span>+ Registrar Kilometraje</span>
            </button>
            <button 
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006655] hover:bg-[#005144] text-white font-semibold text-sm shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span>Registrar Mantenimiento</span>
            </button>
          </div>
        </header>

        {/* FICHAS BENTO PRINCIPALES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map(vehicle => {
            const isWarning = vehicle.next_service_km && (vehicle.next_service_km - vehicle.current_km <= 1000);
            const remaining = vehicle.next_service_km ? vehicle.next_service_km - vehicle.current_km : 0;
            const progress = vehicle.next_service_km ? Math.min(100, Math.max(0, 100 - (remaining / 5000) * 100)) : 100;
            
            return (
              <div key={vehicle.id} className={`bg-white rounded-3xl p-6 border border-outline-subtle shadow-card flex flex-col justify-between transition-all relative overflow-hidden ${isWarning ? 'hover:border-amber-300' : 'hover:border-slate-300'}`}>
                {isWarning && <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400"></div>}
                
                <div>
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isWarning ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-[#006655] border-emerald-100'}`}>
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
                    {isWarning ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="material-symbols-outlined text-[15px] text-amber-600">warning</span>
                        Atención requerida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-[#006655]">
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
                      <span className={`font-mono text-lg font-bold ${isWarning ? 'text-amber-600' : 'text-[#006655]'}`}>km</span>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600">Próximo servicio: <strong className="font-mono text-slate-900 font-semibold">{vehicle.next_service_km?.toLocaleString() || 'N/A'} km</strong></span>
                        <span className={`${isWarning ? 'text-amber-700 font-bold' : 'text-[#006655] font-semibold'} font-mono`}>
                          {vehicle.next_service_km ? `Faltan ${remaining.toLocaleString()} km` : 'Sin programar'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className={`${isWarning ? 'bg-amber-500' : 'bg-[#006655]'} h-full rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                      </div>
                      {isWarning && (
                        <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200/70 flex items-center gap-1.5 text-xs text-amber-800">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">error</span>
                          <span><strong>¡Atención!</strong> Faltan {remaining} km para mantenimiento.</span>
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
              <button onClick={() => setKmFilter('all')} className={`px-3 py-1 rounded-full transition-all ${kmFilter === 'all' ? 'bg-white text-on-surface shadow-sm' : 'text-slate-600'}`}>Todos</button>
              {vehicles.map(v => (
                <button key={v.id} onClick={() => setKmFilter(v.id)} className={`px-3 py-1 rounded-full transition-all ${kmFilter === v.id ? 'bg-white text-on-surface shadow-sm' : 'text-slate-600'}`}>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMileage.map(log => {
                  const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                  const isYaris = vehicle?.brand === 'Toyota';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-slate-500 text-xs">{log.date}</td>
                      <td className="py-3.5 px-3 font-semibold text-on-surface">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isYaris ? 'bg-[#006655]' : 'bg-amber-500'}`}></span>
                          <span>{vehicle?.brand} {vehicle?.model}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{log.km?.toLocaleString()} km</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-700 font-medium">
                          {log.user_id === 'edc938dc-9fbc-4573-b007-0bdb95114f95' ? 'Cristhian Fuentes' : 'Jennifer Camaño'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

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
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {maintenanceLogs.length} Servicios Registrados
            </span>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {maintenanceLogs.map(log => {
                  const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-slate-500 text-xs">{log.date}</td>
                      <td className="py-3.5 px-3 font-semibold text-on-surface">{vehicle?.brand} {vehicle?.model}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-800">
                        {log.service}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{log.km?.toLocaleString()} km</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-right text-rose-600">-B/. {log.cost?.toFixed(2)}</td>
                      <td className="py-3.5 px-3 text-right text-xs text-slate-600 font-medium">{log.shop || 'N/A'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
    </div>
  );
}
