'use client';

import { useState, useTransition } from 'react';
import { X, Heart, Users, UserPlus, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, Edit2, Check, ArrowRight, DollarSign } from 'lucide-react';
import { 
  VendedorAdmin, 
  createSellerAction, 
  updateSellerAction, 
  toggleSellerStateAction,
  setupSeptiembreReplacementAction 
} from '@/app/actions/admin_valisbiz';
import { Btn3D } from '@/app/components/Btn3D';

interface ValisBizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendedores: VendedorAdmin[];
  onSaved: () => void;
}

type TabType = 'septiembre' | 'crud' | 'metas';

export function ValisBizSettingsModal({ isOpen, onClose, vendedores: initialVendedores, onSaved }: ValisBizSettingsModalProps) {
  const [tab, setTab] = useState<TabType>('septiembre');
  const [vendedores, setVendedores] = useState<VendedorAdmin[]>(initialVendedores);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form para agregar nuevo vendedor
  const [nombre, setNombre] = useState('');
  const [rutaAsignada, setRutaAsignada] = useState('');
  const [cuotaMensual, setCuotaMensual] = useState('');
  const [estadoNuevo, setEstadoNuevo] = useState<'activo' | 'vacaciones' | 'inactivo'>('activo');

  // Estado para edición en línea de cuotas
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editRuta, setEditRuta] = useState('');
  const [editCuota, setEditCuota] = useState('');
  const [editEstado, setEditEstado] = useState<'activo' | 'vacaciones' | 'inactivo'>('activo');

  if (!isOpen) return null;

  const activeSellers = vendedores.filter(v => v.estado === 'activo' || v.activo);
  const absentSellers = vendedores.filter(v => v.estado === 'vacaciones');

  const joseph = vendedores.find(v => v.nombre.toLowerCase().includes('joseph'));
  const carolina = vendedores.find(v => v.nombre.toLowerCase().includes('carolina'));

  const handleSetupSeptiembre = () => {
    if (!joseph || !carolina) {
      setErrorMsg('No se encontraron los perfiles de Joseph Domínguez o Carolina Sucre.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    startTransition(async () => {
      const res = await setupSeptiembreReplacementAction({
        activeSellerId: carolina.id,
        absentSellerId: joseph.id,
        targetQuota: 20000.00,
      });

      if (res.success) {
        setSuccessMsg('✅ Carolina Sucre configurada con la meta de Joseph (B/. 20,000.00) para Septiembre 2026.');
        onSaved();
      } else {
        setErrorMsg(res.error || 'Error al aplicar el reemplazo.');
      }
    });
  };

  const handleCreateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('El nombre del vendedor es obligatorio.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');

    startTransition(async () => {
      const res = await createSellerAction({
        nombre,
        ruta_asignada: rutaAsignada,
        cuota_mensual: parseFloat(cuotaMensual) || 0,
        estado: estadoNuevo,
      });

      if (res.success) {
        setSuccessMsg(`✅ Vendedor ${nombre} registrado exitosamente.`);
        setNombre('');
        setRutaAsignada('');
        setCuotaMensual('');
        onSaved();
      } else {
        setErrorMsg(res.error || 'Error al guardar el vendedor.');
      }
    });
  };

  const handleStartEdit = (v: VendedorAdmin) => {
    setEditingId(v.id);
    setEditNombre(v.nombre);
    setEditRuta(v.ruta_asignada || '');
    setEditCuota(v.cuota_mensual.toString());
    setEditEstado(v.estado);
  };

  const handleSaveEdit = (id: string) => {
    setErrorMsg('');
    setSuccessMsg('');

    startTransition(async () => {
      const res = await updateSellerAction(id, {
        nombre: editNombre,
        ruta_asignada: editRuta,
        cuota_mensual: parseFloat(editCuota) || 0,
        estado: editEstado,
      });

      if (res.success) {
        setSuccessMsg('✅ Vendedor actualizado.');
        setEditingId(null);
        onSaved();
      } else {
        setErrorMsg(res.error || 'Error al actualizar vendedor.');
      }
    });
  };

  const handleToggleState = (id: string, newEstado: 'activo' | 'vacaciones' | 'inactivo') => {
    startTransition(async () => {
      const res = await toggleSellerStateAction(id, newEstado);
      if (res.success) {
        setSuccessMsg('✅ Estado actualizado.');
        onSaved();
      } else {
        setErrorMsg(res.error || 'Error al cambiar estado.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <header className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-pink-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-400">
              <Heart className="w-5 h-5 fill-pink-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Configuración ValisBiz</h2>
              <p className="text-xs text-pink-200/80">Gestión de vendedores, reemplazos temporales y metas mensuales</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => setTab('septiembre')}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              tab === 'septiembre' ? 'border-pink-600 text-pink-600 bg-white shadow-xs' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
            Vendedores Activos y Ausentes
          </button>
          <button
            onClick={() => setTab('crud')}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              tab === 'crud' ? 'border-pink-600 text-pink-600 bg-white shadow-xs' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            Gestión de Personal (CRUD)
          </button>
          <button
            onClick={() => setTab('metas')}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
              tab === 'metas' ? 'border-pink-600 text-pink-600 bg-white shadow-xs' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Metas y Cuotas Mensuales
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && <div className="mx-6 mt-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold">{errorMsg}</div>}
        {successMsg && <div className="mx-6 mt-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">{successMsg}</div>}

        {/* Modal Body Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ── TAB 1: VENDEDORES ACTIVOS Y AUSENTES ── */}
          {tab === 'septiembre' && (
            <div className="space-y-6">
              
              {/* Vendedores Activos este Mes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Vendedores Activos en Ruta
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {vendedores.filter(v => v.estado === 'activo').map(v => (
                    <div key={v.id} className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">Activo</span>
                        <h5 className="font-bold text-slate-900 text-sm">{v.nombre}</h5>
                        <p className="text-xs text-slate-500">{v.ruta_asignada || 'Sin ruta'}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                        <span className="text-xs text-slate-600">Cuota:</span>
                        <span className="font-mono font-bold text-emerald-800 text-sm">B/. {v.cuota_mensual.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendedores en Vacaciones / Ausentes */}
              {absentSellers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Vendedores en Vacaciones / Ausentes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {absentSellers.map(v => (
                      <div key={v.id} className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">Vacaciones</span>
                          <h5 className="font-bold text-slate-900 text-sm">{v.nombre}</h5>
                          <p className="text-xs text-slate-500">Historial intacto</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                          <button 
                            onClick={() => handleToggleState(v.id, 'activo')}
                            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
                          >
                            Reincorporar a Ruta →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── TAB 2: GESTIÓN DE PERSONAL (CRUD) ── */}
          {tab === 'crud' && (
            <div className="space-y-6">

              {/* Formulario Nuevo Vendedor */}
              <form onSubmit={handleCreateSeller} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" /> Registrar Nuevo Vendedor o Reemplazo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo *</label>
                    <input 
                      type="text" 
                      value={nombre} 
                      onChange={e => setNombre(e.target.value)} 
                      placeholder="Ej: Carolina Sucre" 
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pink-300 focus:outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ruta Asignada</label>
                    <input 
                      type="text" 
                      value={rutaAsignada} 
                      onChange={e => setRutaAsignada(e.target.value)} 
                      placeholder="Ej: Panamá Oeste" 
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-pink-300 focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cuota Mensual (B/.)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={cuotaMensual} 
                      onChange={e => setCuotaMensual(e.target.value)} 
                      placeholder="20000.00" 
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-pink-300 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Estado Inicial</label>
                    <select 
                      value={estadoNuevo} 
                      onChange={e => setEstadoNuevo(e.target.value as any)} 
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-pink-300 focus:outline-none"
                    >
                      <option value="activo">Activo en Ruta</option>
                      <option value="vacaciones">Vacaciones / Reemplazado</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Btn3D type="submit" color="blue" size="sm" isLoading={isPending} loadingText="Guardando...">
                    Guardar Nuevo Vendedor
                  </Btn3D>
                </div>
              </form>

              {/* Lista Completa de Vendedores */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Vendedores Registrados en el Sistema</h4>
                <div className="space-y-3">
                  {vendedores.map(v => {
                    const isEditing = editingId === v.id;
                    return (
                      <div key={v.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {isEditing ? (
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Nombre" />
                            <input type="text" value={editRuta} onChange={e => setEditRuta(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm" placeholder="Ruta" />
                            <input type="number" value={editCuota} onChange={e => setEditCuota(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm font-mono" placeholder="Cuota B/." />
                            <select value={editEstado} onChange={e => setEditEstado(e.target.value as any)} className="px-3 py-1.5 border rounded-lg text-sm bg-white">
                              <option value="activo">Activo</option>
                              <option value="vacaciones">Vacaciones</option>
                              <option value="inactivo">Inactivo</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${v.estado === 'activo' ? 'bg-emerald-500' : v.estado === 'vacaciones' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm">{v.nombre}</h5>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${v.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : v.estado === 'vacaciones' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                  {v.estado}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{v.ruta_asignada || 'Sin ruta'} • Cuota: B/. {v.cuota_mensual.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleSaveEdit(v.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Guardar</button>
                              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300">Cancelar</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleStartEdit(v)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Editar vendedor">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <select 
                                value={v.estado} 
                                onChange={e => handleToggleState(v.id, e.target.value as any)}
                                className="px-2.5 py-1 text-xs font-semibold border rounded-lg bg-slate-50 text-slate-700"
                              >
                                <option value="activo">Activo</option>
                                <option value="vacaciones">Vacaciones</option>
                                <option value="inactivo">Inactivo</option>
                              </select>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ── TAB 3: METAS Y CUOTAS MENSUALES ── */}
          {tab === 'metas' && (
            <div className="space-y-6">
              
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <strong className="block text-sm font-bold text-emerald-900 mb-1">Ajuste de Cuotas Individuales y Meta Global</strong>
                  La meta global del equipo se calcula automáticamente sumando las cuotas mensuales de los vendedores activos en el período actual. Puedes actualizar las cuotas individuales en cualquier momento.
                </div>
              </div>

              {/* Resumen Metas Activas */}
              <div className="space-y-3">
                {vendedores.map(v => (
                  <div key={v.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{v.nombre}</h5>
                      <p className="text-xs text-slate-500">{v.ruta_asignada || 'Sin ruta'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Cuota Mensual</span>
                        <span className="font-mono font-bold text-slate-900 text-base">B/. {v.cuota_mensual.toLocaleString('es-PA', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <button onClick={() => { setTab('crud'); handleStartEdit(v); }} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold">
                        Editar Cuota
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total acumulado de cuotas de vendedores activos */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl flex items-center justify-between border border-slate-800">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Cuota Global Calculada del Equipo</span>
                  <p className="text-2xl font-mono font-bold mt-0.5">B/. {activeSellers.reduce((acc, v) => acc + v.cuota_mensual, 0).toLocaleString('es-PA', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <span>{activeSellers.length} vendedores activos</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <Btn3D color="gray" onClick={onClose}>
            Cerrar
          </Btn3D>
        </footer>

      </div>
    </div>
  );
}
