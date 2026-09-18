'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Shield, Users, Truck, FileText, AlignLeft, User } from 'lucide-react';

interface ReporteDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  reporte: any | null;
}

export default function ReporteDetalleModal({ isOpen, onClose, reporte }: ReporteDetalleModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !reporte) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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

          {/* Narrativa */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5"><AlignLeft className="w-4 h-4"/> Detalle Operativo Completo</h3>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{reporte.narrativa || 'Sin observaciones detalladas.'}</p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-800/80"></div>



        </div>
      </div>
    </div>,
    document.body
  );
}
