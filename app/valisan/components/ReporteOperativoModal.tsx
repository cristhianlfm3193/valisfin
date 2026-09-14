'use client';

import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Clock, Calendar, Shield, Save, FileText, Loader2, Sparkles, UserCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export default function ReporteOperativoModal({ isOpen, onClose, onSuccess, initialData }: ModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form State
  const [departamento, setDepartamento] = useState('POLICÍA AEROPORTUARIA');
  const [asunto, setAsunto] = useState('');
  
  // Format dates correctly for inputs
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);
  
  const [fecha, setFecha] = useState(dateStr);
  const [hora, setHora] = useState(timeStr);
  
  const [narrativa, setNarrativa] = useState('');

  // Firmas
  const [reporta, setReporta] = useState<{ rango: string; placa: string; nombre: string; verificado_bdrh?: boolean }>({ rango: '', placa: '', nombre: '', verificado_bdrh: false });
  const [informa, setInforma] = useState<{ rango: string; placa: string; nombre: string; verificado_bdrh?: boolean }>({ rango: '', placa: '', nombre: '', verificado_bdrh: false });

  // Helper de búsqueda en BD-RH institucional
  const lookupTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const handleLookupPlaca = (key: string, query: string, callback: (officer: any) => void) => {
    if (lookupTimeoutRef.current[key]) {
      clearTimeout(lookupTimeoutRef.current[key]);
    }
    const cleanQ = query?.trim();
    if (!cleanQ || cleanQ.length < 3) return;

    lookupTimeoutRef.current[key] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/valisan/bdrh-lookup?q=${encodeURIComponent(cleanQ)}`);
        const data = await res.json();
        if (data.found && data.persona) {
          callback(data.persona);
        }
      } catch (err) {
        console.error('Error buscando oficial en BD-RH:', err);
      }
    }, 280);
  };

  useEffect(() => {
    if (initialData && isOpen) {
      if (initialData.departamento) setDepartamento(initialData.departamento);
      if (initialData.asunto) setAsunto(initialData.asunto);
      if (initialData.fecha) setFecha(initialData.fecha);
      if (initialData.hora) setHora(initialData.hora);
      if (initialData.narrativa) setNarrativa(initialData.narrativa);
      if (initialData.reporta) setReporta(initialData.reporta);
      if (initialData.informa) setInforma(initialData.informa);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const isEditing = initialData && initialData.id;
      let reporteId = isEditing ? initialData.id : null;

      const reportPayload = {
        departamento,
        fecha,
        hora,
        asunto,
        narrativa,
        reporta_rango: reporta.rango,
        reporta_placa: reporta.placa,
        reporta_nombre: reporta.nombre,
        informa_rango: informa.rango,
        informa_placa: informa.placa,
        informa_nombre: informa.nombre
      };

      if (isEditing) {
        // 1a. Update Reporte
        const { error: reporteError } = await supabase
          .from('reportes')
          .update(reportPayload)
          .eq('id', reporteId);

        if (reporteError) throw reporteError;
      } else {
        // 1b. Insertar Reporte
        const { data: reporteData, error: reporteError } = await supabase
          .from('reportes')
          .insert([reportPayload])
          .select()
          .single();

        if (reporteError) throw reporteError;
        reporteId = reporteData.id;
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error guardando reporte:", error);
      alert("Hubo un error al guardar el reporte. Verifique la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Registro de Reporte Operativo
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> BD-RH Conectada
                </span>
              </h2>
              <p className="text-xs text-slate-400">Sistema Automatizado ValisAN simplificado</p>
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
          
          {/* Sección 1: Encabezado */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">1</span>
              Datos Generales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Base / Departamento</label>
                <select 
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                >
                  <option value="BATORG">Base Aérea Teniente Octavio Rodríguez Garrido (BATORG)</option>
                  <option value="POLICÍA AEROPORTUARIA">POLICÍA AEROPORTUARIA (AVSEC / DINOA)</option>
                  <option value="G.O.T.A">G.O.T.A • Grupo de Operaciones Tácticas Aeronavales</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Tipo de Reporte (Asunto)</label>
                <input 
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej. Relevo de Turno / Seguridad de pista..."
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Fecha</label>
                <input 
                  type="date" 
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Hora</label>
                <input 
                  type="time" 
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                />
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-slate-800/80"></div>

          {/* Sección 2: Narrativa y Firmas */}
          <section className="space-y-4 pb-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">2</span>
              Detalle Operativo y Firmas
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1 flex items-center gap-1.5"><FileText className="w-4 h-4"/> Detalle Operativo (Narrativa completa)</label>
              <textarea 
                rows={12}
                value={narrativa}
                onChange={(e) => setNarrativa(e.target.value)}
                placeholder="Describa de manera detallada el operativo, áreas recorridas, novedades, etc..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition resize-y"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Quién Reporta */}
              <div className="space-y-3 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/60">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Quién Reporta</h4>
                  {reporta.verificado_bdrh && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Verificado en BD-RH
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Rango" 
                    value={reporta.rango} 
                    onChange={(e) => setReporta({...reporta, rango: e.target.value})} 
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                  />
                  <input 
                    type="text" 
                    placeholder="Placa Institucional (Ej. 81320)" 
                    value={reporta.placa} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setReporta(prev => ({ ...prev, placa: val }));
                      if (val.length >= 3) {
                        handleLookupPlaca('reporta', val, (persona) => {
                          setReporta(prev => ({
                            ...prev,
                            rango: persona.rango || prev.rango,
                            nombre: persona.nombre_completo || prev.nombre,
                            verificado_bdrh: true
                          }));
                        });
                      }
                    }} 
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Nombre Completo" 
                  value={reporta.nombre} 
                  onChange={(e) => setReporta({...reporta, nombre: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                />
              </div>

              {/* Quién Informa */}
              <div className="space-y-3 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/60 opacity-90 hover:opacity-100 transition">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Quién Informa (Opcional)</h4>
                  {informa.verificado_bdrh && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Verificado en BD-RH
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Rango" 
                    value={informa.rango} 
                    onChange={(e) => setInforma({...informa, rango: e.target.value})} 
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                  />
                  <input 
                    type="text" 
                    placeholder="Placa" 
                    value={informa.placa} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setInforma(prev => ({ ...prev, placa: val }));
                      if (val.length >= 3) {
                        handleLookupPlaca('informa', val, (persona) => {
                          setInforma(prev => ({
                            ...prev,
                            rango: persona.rango || prev.rango,
                            nombre: persona.nombre_completo || prev.nombre,
                            verificado_bdrh: true
                          }));
                        });
                      }
                    }} 
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Nombre Completo" 
                  value={informa.nombre} 
                  onChange={(e) => setInforma({...informa, nombre: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium" 
                />
              </div>
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-cyan-500/20 bg-slate-900/80 flex items-center justify-end gap-3 backdrop-blur-md">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGuardar}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Guardando...' : 'Guardar Reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}
