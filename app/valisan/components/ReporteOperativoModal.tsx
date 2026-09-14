'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, CheckCircle, Clock, Calendar, Shield, Save, FileText, Loader2, Sparkles, UserCheck } from 'lucide-react';
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
  const [step, setStep] = useState(1);

  // Form State
  const [departamento, setDepartamento] = useState('POLICÍA AEROPORTUARIA');
  const [asunto, setAsunto] = useState('Recorrido Perimetral');
  
  // Format dates correctly for inputs
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);
  
  const [fecha, setFecha] = useState(dateStr);
  const [hora, setHora] = useState(timeStr);
  
  const [areasRecorrido, setAreasRecorrido] = useState('');
  const [equiposNovedad, setEquiposNovedad] = useState('');
  const [narrativa, setNarrativa] = useState('');

  // Firmas
  const [reporta, setReporta] = useState<{ rango: string; placa: string; nombre: string; verificado_bdrh?: boolean }>({ rango: '', placa: '', nombre: '', verificado_bdrh: false });
  const [informa, setInforma] = useState<{ rango: string; placa: string; nombre: string; verificado_bdrh?: boolean }>({ rango: '', placa: '', nombre: '', verificado_bdrh: false });

  // Arrays
  const [vehiculos, setVehiculos] = useState<any[]>([{ numero_movil: '', placa_vehiculo: '', conductor_nombre: '', conductor_id: '', correria: '', verificado_bdrh: false }]);
  const [unidades, setUnidades] = useState<any[]>([{ rol: 'Patrullaje', rango: '', placa_institucional: '', nombre: '', destino: '', verificado_bdrh: false }]);

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

  // Limpiador automático de nombres de bases y placas (evita "de BATOR" o "de AVSEC")
  const cleanVehiculoPlaca = (val: string) => {
    let clean = val.replace(/^de\s+/i, '').replace(/^del\s+/i, '').trim();
    if (/^bator$/i.test(clean) || /^batorg$/i.test(clean)) {
      setDepartamento('BATORG');
      return 'BATORG';
    }
    if (/^avsec$/i.test(clean)) {
      setDepartamento('POLICÍA AEROPORTUARIA');
      return 'AVSEC';
    }
    return clean;
  };

  useEffect(() => {
    if (initialData && isOpen) {
      if (initialData.departamento) setDepartamento(initialData.departamento);
      if (initialData.asunto) setAsunto(initialData.asunto);
      if (initialData.fecha) setFecha(initialData.fecha);
      if (initialData.hora) setHora(initialData.hora);
      if (initialData.narrativa) setNarrativa(initialData.narrativa);
      if (initialData.areas_recorrido) setAreasRecorrido(initialData.areas_recorrido);
      if (initialData.equipos_novedad) setEquiposNovedad(initialData.equipos_novedad);
      if (initialData.reporta) setReporta(initialData.reporta);
      if (initialData.informa) setInforma(initialData.informa);
      
      if (initialData.vehiculos && Array.isArray(initialData.vehiculos) && initialData.vehiculos.length > 0) {
        setVehiculos(initialData.vehiculos.map((v: any) => ({
          ...v,
          placa_vehiculo: cleanVehiculoPlaca(v.placa_vehiculo || '')
        })));
      }
      
      if (initialData.unidades && Array.isArray(initialData.unidades) && initialData.unidades.length > 0) {
        setUnidades(initialData.unidades);
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Handlers for Arrays
  const addVehiculo = () => setVehiculos([...vehiculos, { numero_movil: '', placa_vehiculo: '', conductor_nombre: '', conductor_id: '', correria: '', verificado_bdrh: false }]);
  const removeVehiculo = (index: number) => setVehiculos(vehiculos.filter((_, i) => i !== index));
  
  const addUnidad = (defaultRol = 'Patrullaje') => setUnidades([...unidades, { rol: defaultRol, rango: '', placa_institucional: '', nombre: '', destino: '', verificado_bdrh: false }]);
  const removeUnidad = (index: number) => setUnidades(unidades.filter((_, i) => i !== index));

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
        areas_recorrido: areasRecorrido,
        equipos_novedad: equiposNovedad,
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

        // Limpiar registros relacionados anteriores para re-insertarlos
        await supabase.from('reporte_unidades').delete().eq('reporte_id', reporteId);
        await supabase.from('reporte_vehiculos').delete().eq('reporte_id', reporteId);
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

      // 2. Insertar Unidades
      const validUnidades = unidades.filter(u => u.nombre || u.placa_institucional);
      if (validUnidades.length > 0) {
        const unidadesAInsertar = validUnidades.map(u => ({
          reporte_id: reporteId,
          rol: u.rol,
          rango: u.rango,
          placa_institucional: u.placa_institucional,
          nombre: u.nombre
        }));
        
        const { error: unidadesError } = await supabase
          .from('reporte_unidades')
          .insert(unidadesAInsertar);
          
        if (unidadesError) throw unidadesError;
      }

      // 3. Insertar Vehículos
      const validVehiculos = vehiculos.filter(v => v.numero_movil || v.placa_vehiculo);
      if (validVehiculos.length > 0) {
        const vehiculosAInsertar = validVehiculos.map(v => ({
          reporte_id: reporteId,
          numero_movil: v.numero_movil,
          placa_vehiculo: v.placa_vehiculo,
          conductor_nombre: v.conductor_nombre,
          conductor_id: v.conductor_id,
          correria: v.correria
        }));
        
        const { error: vehiculosError } = await supabase
          .from('reporte_vehiculos')
          .insert(vehiculosAInsertar);
          
        if (vehiculosError) throw vehiculosError;
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
              <p className="text-xs text-slate-400">Sistema Automatizado ValisAN con autocompletado en tiempo real</p>
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
                <select 
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                >
                  <option value="Recorrido Perimetral">Recorrido Perimetral</option>
                  <option value="Relevo de Turno / Puesto Fijo">Relevo de Turno / Puesto Fijo</option>
                  <option value="Traslado de Personal">Traslado de Personal</option>
                </select>
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

          {/* Sección 2: Detalles Dinámicos */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">2</span>
              Detalles Operativos
            </h3>

            {asunto === 'Recorrido Perimetral' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 ml-1">Áreas de Recorrido (separar por comas)</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Pista antigua, Portón 5, Perímetro Norte..."
                    value={areasRecorrido}
                    onChange={(e) => setAreasRecorrido(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                  />
                </div>

                {/* Sub-formulario Vehículos */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2"><CheckCircle className="w-4 h-4 text-sky-400"/> Vehículos Involucrados</h4>
                      <p className="text-[11px] text-slate-400">Ingresa el móvil y base (BATORG / AVSEC). Al tipear el CIP/Cédula del conductor se autocompletará su nombre.</p>
                    </div>
                    <button onClick={addVehiculo} className="text-xs bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-semibold">
                      <Plus className="w-3.5 h-3.5"/> Agregar Móvil
                    </button>
                  </div>
                  {vehiculos.map((veh, idx) => (
                    <div key={`veh-${idx}`} className="space-y-2 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                        <div>
                          <input 
                            type="text" 
                            placeholder="Nº Móvil (Ej. 1064)" 
                            value={veh.numero_movil} 
                            onChange={(e) => {
                              const newV = [...vehiculos]; 
                              newV[idx].numero_movil = e.target.value; 
                              setVehiculos(newV);
                            }} 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500" 
                          />
                        </div>
                        
                        <div>
                          <input 
                            type="text" 
                            placeholder="Placa / Base (Ej. EN5327 o BATORG)" 
                            value={veh.placa_vehiculo} 
                            onChange={(e) => {
                              const newV = [...vehiculos]; 
                              newV[idx].placa_vehiculo = cleanVehiculoPlaca(e.target.value); 
                              setVehiculos(newV);
                            }} 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500" 
                          />
                        </div>

                        <div>
                          <input 
                            type="text" 
                            placeholder="Conductor (Nombre)" 
                            value={veh.conductor_nombre} 
                            onChange={(e) => {
                              const newV = [...vehiculos]; 
                              newV[idx].conductor_nombre = e.target.value; 
                              setVehiculos(newV);
                            }} 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500" 
                          />
                        </div>

                        <div className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            placeholder="CIP / Cédula / Placa" 
                            value={veh.conductor_id} 
                            onChange={(e) => {
                              const val = e.target.value;
                              const newV = [...vehiculos]; 
                              newV[idx].conductor_id = val; 
                              setVehiculos(newV);
                              if (val.length >= 3) {
                                handleLookupPlaca(`cond-${idx}`, val, (persona) => {
                                  const updated = [...vehiculos];
                                  if (updated[idx]) {
                                    updated[idx].conductor_nombre = `${persona.rango} ${persona.nombre_completo}`.trim();
                                    updated[idx].conductor_id = persona.cedula || persona.pos_id;
                                    updated[idx].verificado_bdrh = true;
                                    setVehiculos(updated);
                                  }
                                });
                              }
                            }} 
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500" 
                          />
                          {veh.verificado_bdrh && (
                            <span title="Verificado en BD-RH" className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold whitespace-nowrap">✓ RH</span>
                          )}
                          {idx > 0 && (
                            <button onClick={() => removeVehiculo(idx)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Botones de sugerencia rápida para Base sin escribir "de " */}
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                        <span>Asignar Base:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newV = [...vehiculos];
                            newV[idx].placa_vehiculo = 'BATORG';
                            setVehiculos(newV);
                            setDepartamento('BATORG');
                          }}
                          className="px-2 py-0.5 rounded bg-sky-500/10 hover:bg-sky-500/25 text-sky-300 font-medium transition"
                        >
                          BATORG
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newV = [...vehiculos];
                            newV[idx].placa_vehiculo = 'AVSEC';
                            setVehiculos(newV);
                            setDepartamento('POLICÍA AEROPORTUARIA');
                          }}
                          className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 font-medium transition"
                        >
                          AVSEC
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sub-formulario Unidades */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400"/> Unidades de Patrullaje</h4>
                      <p className="text-[11px] text-slate-400">Escribe la Placa Institucional (Ej. 83404) y el sistema completará Rango y Nombre en automático.</p>
                    </div>
                    <button onClick={() => addUnidad('Patrullaje')} className="text-xs bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-semibold">
                      <Plus className="w-3.5 h-3.5"/> Agregar Unidad
                    </button>
                  </div>
                  {unidades.map((uni, idx) => (
                    <div key={`uni-${idx}`} className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <div>
                        <input 
                          type="text" 
                          placeholder="Rango" 
                          value={uni.rango} 
                          onChange={(e) => {
                            const newU = [...unidades]; 
                            newU[idx].rango = e.target.value; 
                            setUnidades(newU);
                          }} 
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                        />
                      </div>
                      
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Placa Institucional (Ej. 83404)" 
                          value={uni.placa_institucional} 
                          onChange={(e) => {
                            const val = e.target.value;
                            const newU = [...unidades]; 
                            newU[idx].placa_institucional = val; 
                            setUnidades(newU);
                            if (val.length >= 3) {
                              handleLookupPlaca(`uni-${idx}`, val, (persona) => {
                                const updated = [...unidades];
                                if (updated[idx]) {
                                  updated[idx].rango = persona.rango || updated[idx].rango;
                                  updated[idx].nombre = persona.nombre_completo || updated[idx].nombre;
                                  updated[idx].verificado_bdrh = true;
                                  setUnidades(updated);
                                }
                              });
                            }
                          }} 
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white pr-14" 
                        />
                        {uni.verificado_bdrh && (
                          <span className="absolute right-2 top-2 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded font-bold">
                            ✓ BD-RH
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="Nombre completo" 
                          value={uni.nombre} 
                          onChange={(e) => {
                            const newU = [...unidades]; 
                            newU[idx].nombre = e.target.value; 
                            setUnidades(newU);
                          }} 
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                        />
                      </div>

                      <div className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="Dpto / Destino (Ej. INL)" 
                          value={uni.destino || ''} 
                          onChange={(e) => {
                            const newU = [...unidades]; 
                            newU[idx].destino = e.target.value; 
                            setUnidades(newU);
                          }} 
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                        />
                        {idx > 0 && (
                          <button onClick={() => removeUnidad(idx)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition shrink-0">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {asunto === 'Relevo de Turno / Puesto Fijo' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Unidades Entrantes */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Entrantes</h4>
                      <button onClick={() => addUnidad('Entrante')} className="text-[10px] uppercase bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded transition">Añadir</button>
                    </div>
                    {unidades.filter(u => u.rol === 'Entrante' || u.rol?.includes('Puesto') || u.rol === 'Patrullaje').map((uni, idx) => {
                      const realIdx = unidades.indexOf(uni);
                      return (
                        <div key={`uni-in-${realIdx}`} className="space-y-2 p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                          <div className="flex justify-between items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="Puesto / Rol" 
                              value={uni.rol} 
                              onChange={(e) => {
                                const newU = [...unidades]; 
                                newU[realIdx].rol = e.target.value; 
                                setUnidades(newU);
                              }} 
                              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-400 font-semibold" 
                            />
                            {uni.verificado_bdrh && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">✓ BD-RH</span>
                            )}
                          </div>
                          <input 
                            type="text" 
                            placeholder="Rango" 
                            value={uni.rango} 
                            onChange={(e) => {
                              const newU = [...unidades]; 
                              newU[realIdx].rango = e.target.value; 
                              setUnidades(newU);
                            }} 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" 
                          />
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Placa" 
                              value={uni.placa_institucional} 
                              onChange={(e) => {
                                const val = e.target.value;
                                const newU = [...unidades]; 
                                newU[realIdx].placa_institucional = val; 
                                setUnidades(newU);
                                if (val.length >= 3) {
                                  handleLookupPlaca(`uni-in-${realIdx}`, val, (persona) => {
                                    const updated = [...unidades];
                                    if (updated[realIdx]) {
                                      updated[realIdx].rango = persona.rango || updated[realIdx].rango;
                                      updated[realIdx].nombre = persona.nombre_completo || updated[realIdx].nombre;
                                      updated[realIdx].verificado_bdrh = true;
                                      setUnidades(updated);
                                    }
                                  });
                                }
                              }} 
                              className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" 
                            />
                            <input 
                              type="text" 
                              placeholder="Nombre" 
                              value={uni.nombre} 
                              onChange={(e) => {
                                const newU = [...unidades]; 
                                newU[realIdx].nombre = e.target.value; 
                                setUnidades(newU);
                              }} 
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Unidades Salientes */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Salientes</h4>
                      <button onClick={() => addUnidad('Saliente')} className="text-[10px] uppercase bg-rose-500/10 text-rose-400 px-2 py-1 rounded transition">Añadir</button>
                    </div>
                    {unidades.filter(u => u.rol === 'Saliente').map((uni) => {
                      const realIdx = unidades.indexOf(uni);
                      return (
                        <div key={`uni-out-${realIdx}`} className="space-y-2 p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/50">
                          <input 
                            type="text" 
                            placeholder="Rango" 
                            value={uni.rango} 
                            onChange={(e) => {
                              const newU = [...unidades]; 
                              newU[realIdx].rango = e.target.value; 
                              setUnidades(newU);
                            }} 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" 
                          />
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Placa" 
                              value={uni.placa_institucional} 
                              onChange={(e) => {
                                const val = e.target.value;
                                const newU = [...unidades]; 
                                newU[realIdx].placa_institucional = val; 
                                setUnidades(newU);
                                if (val.length >= 3) {
                                  handleLookupPlaca(`uni-out-${realIdx}`, val, (persona) => {
                                    const updated = [...unidades];
                                    if (updated[realIdx]) {
                                      updated[realIdx].rango = persona.rango || updated[realIdx].rango;
                                      updated[realIdx].nombre = persona.nombre_completo || updated[realIdx].nombre;
                                      updated[realIdx].verificado_bdrh = true;
                                      setUnidades(updated);
                                    }
                                  });
                                }
                              }} 
                              className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" 
                            />
                            <input 
                              type="text" 
                              placeholder="Nombre" 
                              value={uni.nombre} 
                              onChange={(e) => {
                                const newU = [...unidades]; 
                                newU[realIdx].nombre = e.target.value; 
                                setUnidades(newU);
                              }} 
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 ml-1">Equipos / Novedad (Ej. 01 Radio OP, Estado Operativo...)</label>
                  <input 
                    type="text" 
                    value={equiposNovedad}
                    onChange={(e) => setEquiposNovedad(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            {asunto === 'Traslado de Personal' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Vehículo para traslado */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400"/> Vehículo de Traslado</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Nº Móvil" 
                      value={vehiculos[0]?.numero_movil || ''} 
                      onChange={(e) => {
                        const newV = [...vehiculos]; 
                        if (!newV[0]) newV.push({ numero_movil: '', placa_vehiculo: '', conductor_nombre: '', conductor_id: '', correria: '' });
                        newV[0].numero_movil = e.target.value; 
                        setVehiculos(newV);
                      }} 
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                    />
                    <input 
                      type="text" 
                      placeholder="Conductor" 
                      value={vehiculos[0]?.conductor_nombre || ''} 
                      onChange={(e) => {
                        const newV = [...vehiculos]; 
                        if (!newV[0]) newV.push({ numero_movil: '', placa_vehiculo: '', conductor_nombre: '', conductor_id: '', correria: '' });
                        newV[0].conductor_nombre = e.target.value; 
                        setVehiculos(newV);
                      }} 
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                    />
                    <input 
                      type="text" 
                      placeholder="Correría / Misión" 
                      value={vehiculos[0]?.correria || ''} 
                      onChange={(e) => {
                        const newV = [...vehiculos]; 
                        if (!newV[0]) newV.push({ numero_movil: '', placa_vehiculo: '', conductor_nombre: '', conductor_id: '', correria: '' });
                        newV[0].correria = e.target.value; 
                        setVehiculos(newV);
                      }} 
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                    />
                  </div>
                </div>

                {/* Unidades Trasladadas */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400"/> Personal Trasladado</h4>
                    <button onClick={() => addUnidad('Trasladada')} className="text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-semibold">
                      <Plus className="w-3.5 h-3.5"/> Agregar
                    </button>
                  </div>
                  {unidades.map((uni, idx) => (
                    <div key={`uni-tras-${idx}`} className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <input 
                        type="text" 
                        placeholder="Rango" 
                        value={uni.rango} 
                        onChange={(e) => {
                          const newU = [...unidades]; 
                          newU[idx].rango = e.target.value; 
                          setUnidades(newU);
                        }} 
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Placa / CIP" 
                        value={uni.placa_institucional} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const newU = [...unidades]; 
                          newU[idx].placa_institucional = val; 
                          setUnidades(newU);
                          if (val.length >= 3) {
                            handleLookupPlaca(`uni-tras-${idx}`, val, (persona) => {
                              const updated = [...unidades];
                              if (updated[idx]) {
                                updated[idx].rango = persona.rango || updated[idx].rango;
                                updated[idx].nombre = persona.nombre_completo || updated[idx].nombre;
                                updated[idx].verificado_bdrh = true;
                                setUnidades(updated);
                              }
                            });
                          }
                        }} 
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Nombre" 
                        value={uni.nombre} 
                        onChange={(e) => {
                          const newU = [...unidades]; 
                          newU[idx].nombre = e.target.value; 
                          setUnidades(newU);
                        }} 
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Puesto de Destino" 
                        value={uni.destino} 
                        onChange={(e) => {
                          const newU = [...unidades]; 
                          newU[idx].destino = e.target.value; 
                          setUnidades(newU);
                        }} 
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="h-px w-full bg-slate-800/80"></div>

          {/* Sección 3: Narrativa y Firmas */}
          <section className="space-y-4 pb-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">3</span>
              Observaciones y Firmas
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1 flex items-center gap-1.5"><FileText className="w-4 h-4"/> Narrativa / Observación Operativa</label>
              <textarea 
                rows={4}
                value={narrativa}
                onChange={(e) => setNarrativa(e.target.value)}
                placeholder="Describa de manera detallada las novedades operativas..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition resize-none"
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
