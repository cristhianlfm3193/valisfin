'use client';

import { X, Calendar, Clock, Shield, Users, Truck, FileText, AlignLeft, User } from 'lucide-react';

interface ReporteDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporte: any | null;
}

export default function ReporteDetalleModal({ isOpen, onClose, reporte }: ReporteDetalleModalProps) {
  if (!isOpen || !reporte) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-[#0a1426] border border-cyan-500/30 rounded-3xl w-full max-w-4xl shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-cyan-500/20 bg-slate-900/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Detalles del Reporte Operativo</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">ID: {reporte.id.substring(0,8)}...</span>
                <span>• {reporte.departamento}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          
          {/* Fila de Tarjetas Superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3 text-cyan-400"/> Fecha</span>
              <span className="text-sm font-semibold text-white">{reporte.fecha}</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3 text-sky-400"/> Hora</span>
              <span className="text-sm font-semibold text-white">{reporte.hora?.substring(0, 5) || '--:--'} hrs</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1.5"><Shield className="w-3 h-3 text-indigo-400"/> Asunto</span>
              <span className="text-sm font-semibold text-white">{reporte.asunto}</span>
            </div>
          </div>

          <div className="h-px w-full bg-slate-800/80"></div>

          {/* Personal que Reporta/Informa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5"><User className="w-4 h-4"/> Oficial que Reporta</h4>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-white font-medium">{reporte.reporta_rango} {reporte.reporta_nombre}</span>
                <span className="text-xs text-slate-400">Placa Institucional: {reporte.reporta_placa || 'N/A'}</span>
              </div>
            </div>
            
            {reporte.informa_nombre && (
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 space-y-3">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5"><User className="w-4 h-4"/> Superior Informado</h4>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-white font-medium">{reporte.informa_rango} {reporte.informa_nombre}</span>
                  <span className="text-xs text-slate-400">Placa Institucional: {reporte.informa_placa || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-px w-full bg-slate-800/80"></div>

          {/* Información Específica */}
          {(reporte.areas_recorrido || reporte.equipos_novedad) && (
             <div className="space-y-4">
               <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Detalles Operativos Específicos</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {reporte.areas_recorrido && (
                   <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                     <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Áreas de Recorrido</span>
                     <p className="text-sm text-slate-300 leading-relaxed">{reporte.areas_recorrido}</p>
                   </div>
                 )}
                 {reporte.equipos_novedad && (
                   <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                     <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Novedades de Equipos / Instalaciones</span>
                     <p className="text-sm text-slate-300 leading-relaxed">{reporte.equipos_novedad}</p>
                   </div>
                 )}
               </div>
             </div>
          )}

          {/* Narrativa */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5"><AlignLeft className="w-4 h-4"/> Narrativa Completa</h3>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{reporte.narrativa || 'Sin observaciones detalladas.'}</p>
            </div>
          </div>

          {/* Unidades y Vehículos Relacionados (Si los hay en el Join) */}
          {(reporte.reporte_unidades?.length > 0 || reporte.reporte_vehiculos?.length > 0) && (
            <>
              <div className="h-px w-full bg-slate-800/80"></div>
              <div className="space-y-6">
                
                {reporte.reporte_unidades?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-4 h-4"/> Unidades en Servicio</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {reporte.reporte_unidades.map((u: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/40">
                          <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 text-xs font-bold border border-sky-500/20">
                            {i+1}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{u.rango} {u.nombre}</p>
                            <p className="text-[10px] text-slate-400">CIP/Placa: {u.placa_institucional || 'N/A'} • {u.rol}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reporte.reporte_vehiculos?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5"><Truck className="w-4 h-4"/> Vehículos Asignados</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {reporte.reporte_vehiculos.map((v: any, i: number) => (
                        <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-white uppercase">{v.numero_movil || 'Vehículo sin Nº'}</p>
                              <p className="text-[10px] text-slate-400">Placa: {v.placa_vehiculo || 'N/A'}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/20">
                              {v.correria || 'Asignado'}
                            </span>
                          </div>
                          {(v.conductor_nombre || v.conductor_id) && (
                            <div className="pt-2 border-t border-slate-800/60 mt-1">
                              <p className="text-[10px] text-slate-500">Conducido por:</p>
                              <p className="text-xs font-medium text-slate-300">{v.conductor_nombre} <span className="text-slate-500 ml-1">{v.conductor_id}</span></p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
