'use client';

import { useState, useTransition } from 'react';
import { X, CheckCircle2, XCircle, Plus } from 'lucide-react';
import type { Local, Vendedor, VisitaMensual } from '@/types/valisbiz';
import { registrarVisita, editarVisita } from '../acciones/crm';
import ModalLocal from './ModalLocal';

interface ModalVisitaProps {
  onClose: () => void;
  locales: Local[];
  vendedores: Vendedor[];
  localInicial?: Local | null;
  visitaAEditar?: VisitaMensual | null;
}

export default function ModalVisita({ onClose, locales, vendedores, localInicial, visitaAEditar }: ModalVisitaProps) {
  const isEditing = !!visitaAEditar;


  const [localId, setLocalId] = useState(
    visitaAEditar?.local_id || localInicial?.id || ''
  );
  const [vendedorId, setVendedorId] = useState(
    visitaAEditar?.vendedor_id || ''
  );
  const [searchLocal, setSearchLocal] = useState(
    visitaAEditar?.local?.nombre_local || localInicial?.nombre_local || ''
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [estadoVisita, setEstadoVisita] = useState<'con_compra' | 'sin_compra' | ''>(
    (visitaAEditar?.estado_visita as 'con_compra' | 'sin_compra') || ''
  );
  const [fecha, setFecha] = useState(
    visitaAEditar?.fecha || new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
  );
  const [montoReportado, setMontoReportado] = useState<string>(
    visitaAEditar?.monto_reportado ? String(visitaAEditar.monto_reportado) : ''
  );
  const [ordenPedido, setOrdenPedido] = useState<string>(
    visitaAEditar?.orden_pedido || ''
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showModalNuevoLocal, setShowModalNuevoLocal] = useState(false);

  const localSeleccionado = locales.find(l => l.id === localId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!localId || !vendedorId || !estadoVisita) return;
    
    startTransition(async () => {
      try {
        if (isEditing && visitaAEditar) {
          await editarVisita(visitaAEditar.id, {
            local_id: localId,
            vendedor_id: vendedorId,
            estado_visita: estadoVisita,
            fecha: fecha,
            monto_reportado: estadoVisita === 'con_compra' && montoReportado ? parseFloat(montoReportado) : null,
            orden_pedido: estadoVisita === 'con_compra' && ordenPedido.trim() ? ordenPedido.trim() : null
          });
        } else {
          await registrarVisita({
            local_id: localId,
            vendedor_id: vendedorId,
            estado_visita: estadoVisita,
            fecha: fecha,
            monto_reportado: estadoVisita === 'con_compra' && montoReportado ? parseFloat(montoReportado) : null,
            orden_pedido: estadoVisita === 'con_compra' && ordenPedido.trim() ? ordenPedido.trim() : null
          });
        }
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Ocurrió un error inesperado al guardar la visita.');
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#121c27] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="font-bold text-lg text-slate-200">
            {isEditing ? 'Editar Visita' : 'Registrar Visita'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-400 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-400">Fecha de Visita</label>
            <input 
              type="date" 
              required
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[16px] sm:text-sm font-medium text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            />
          </div>



          <div className="flex flex-col gap-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-400">Punto de Venta (Local)</label>
              <button 
                type="button" 
                onClick={() => setShowModalNuevoLocal(true)}
                className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo
              </button>
            </div>
            <input 
              required
              type="text"
              value={searchLocal}
              onChange={e => {
                setSearchLocal(e.target.value);
                setShowDropdown(true);
                setLocalId('');
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Buscar local..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[16px] sm:text-sm font-medium text-slate-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            />
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#121c27] border border-white/10 rounded-xl shadow-lg z-50">
                {locales.filter(l => {
                  if (l.activo === false) return false;
                  if (searchLocal && !l.nombre_local.toLowerCase().includes(searchLocal.toLowerCase())) return false;
                  return true;
                }).map(l => (
                  <div 
                    key={l.id} 
                    className="px-4 py-2 hover:bg-pink-50 cursor-pointer text-sm font-medium text-slate-300"
                    onClick={() => {
                      setLocalId(l.id);
                      setSearchLocal(l.nombre_local);
                      setVendedorId(l.vendedor_id || '');
                      setShowDropdown(false);
                    }}
                  >
                    {l.nombre_local} <span className="text-xs text-slate-400">({l.tipo})</span>
                  </div>
                ))}
                {locales.filter(l => {
                  if (l.activo === false) return false;
                  if (searchLocal && !l.nombre_local.toLowerCase().includes(searchLocal.toLowerCase())) return false;
                  return true;
                }).length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron locales.</div>
                )}
              </div>
            )}
            
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-bold text-slate-400">Vendedor (Quien visitó)</label>
                {!localSeleccionado?.vendedor_id && (
                  <span className="text-[10px] font-bold text-amber-400">Sin vendedor base</span>
                )}
              </div>
              <select 
                className="w-full bg-[#121c27] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                value={vendedorId}
                onChange={e => setVendedorId(e.target.value)}
              >
                <option value="sin_vendedor">-- Seleccionar Vendedor --</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
              {localSeleccionado?.vendedor_id && vendedorId !== localSeleccionado.vendedor_id && vendedorId !== 'sin_vendedor' && vendedorId !== '' && (
                <p className="text-[10px] text-amber-500 mt-1.5 flex items-center gap-1">
                  ⚠ Diferente al vendedor base ({localSeleccionado.vendedor?.nombre || vendedores.find(v => v.id === localSeleccionado.vendedor_id)?.nombre})
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-400">Resultado de la Visita</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setEstadoVisita('con_compra')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${estadoVisita === 'con_compra' ? 'border-pink-500 bg-pink-50/10 text-pink-400' : 'border-white/5 bg-[#121c27] text-slate-500 hover:border-pink-200/20'}`}
              >
                <CheckCircle2 className={`w-6 h-6 ${estadoVisita === 'con_compra' ? 'text-pink-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-center leading-tight">Visitado<br/>Con Compra</span>
              </button>
              <button 
                type="button"
                onClick={() => setEstadoVisita('sin_compra')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${estadoVisita === 'sin_compra' ? 'border-amber-500 bg-red-50/10 text-red-400' : 'border-white/5 bg-[#121c27] text-slate-500 hover:border-amber-200/20'}`}
              >
                <XCircle className={`w-6 h-6 ${estadoVisita === 'sin_compra' ? 'text-red-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-center leading-tight">Visitado<br/>Sin Compra</span>
              </button>
            </div>
          </div>

          {estadoVisita === 'con_compra' && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-400">Monto Reportado ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={montoReportado}
                    onChange={e => setMontoReportado(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-pink-500/30 rounded-xl pl-8 pr-4 py-2.5 text-[16px] sm:text-sm font-medium text-pink-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-400">Orden de pedido</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">N°</span>
                  <input 
                    type="text"
                    value={ordenPedido}
                    onChange={e => setOrdenPedido(e.target.value)}
                    placeholder="Número de orden único"
                    className="w-full bg-white/5 border border-pink-500/30 rounded-xl pl-11 pr-4 py-2.5 text-[16px] sm:text-sm font-medium text-pink-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mt-1 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-semibold text-center animate-in fade-in zoom-in">
              {errorMsg}
            </div>
          )}

          <div className="mt-2">
            <button 
              type="submit"
              disabled={isPending || !localId || !vendedorId || vendedorId === 'sin_vendedor' || !estadoVisita}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md shadow-slate-900/20"
            >
              {isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isEditing ? 'Guardar Cambios' : 'Guardar Visita')}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    {showModalNuevoLocal && (
      <ModalLocal 
        onClose={() => setShowModalNuevoLocal(false)}
        vendedores={vendedores}
        onOptimisticUpdate={(data) => {
          if (data.nombre_local) {
            setSearchLocal(data.nombre_local);
            // El ID real será asignado por la DB y llegará tras el revalidatePath
            // Mientras tanto, se puede dejar el input con el texto.
          }
        }}
      />
    )}
    </>
  );
}
