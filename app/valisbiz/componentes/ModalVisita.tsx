'use client';

import { useState, useTransition } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import type { Local, Vendedor, VisitaMensual } from '@/types/valisbiz';
import { registrarVisita, editarVisita } from '../acciones/crm';

interface ModalVisitaProps {
  onClose: () => void;
  locales: Local[];
  vendedores: Vendedor[];
  localInicial?: Local | null;
  visitaAEditar?: VisitaMensual | null;
}

export default function ModalVisita({ onClose, locales, vendedores, localInicial, visitaAEditar }: ModalVisitaProps) {
  const isEditing = !!visitaAEditar;

  const [tipoLocal, setTipoLocal] = useState<string>(
    visitaAEditar?.local?.tipo || localInicial?.tipo || ''
  );
  const [localId, setLocalId] = useState(
    visitaAEditar?.local_id || localInicial?.id || ''
  );
  const [vendedorId, setVendedorId] = useState(
    visitaAEditar?.vendedor_id || ''
  );
  const [filtroVendedor, setFiltroVendedor] = useState(
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
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId || !vendedorId || !estadoVisita) return;
    
    startTransition(async () => {
      if (isEditing && visitaAEditar) {
        await editarVisita(visitaAEditar.id, {
          local_id: localId,
          vendedor_id: vendedorId,
          estado_visita: estadoVisita,
          fecha: fecha
        });
      } else {
        await registrarVisita({
          local_id: localId,
          vendedor_id: vendedorId,
          estado_visita: estadoVisita,
          fecha: fecha
        });
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">
            {isEditing ? 'Editar Visita' : 'Registrar Visita'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Fecha de Visita</label>
            <input 
              type="date" 
              required
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Vendedor</label>
            <select 
              required
              value={vendedorId}
              onChange={e => {
                setVendedorId(e.target.value);
                setFiltroVendedor(e.target.value);
                setLocalId('');
                setSearchLocal('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            >
              <option value="">¿Quién realizó la visita?</option>
              <option value="sin_vendedor">-- Filtrar locales sin dueño --</option>
              {vendedores.map(v => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Tipo de Local</label>
            <select 
              value={tipoLocal}
              onChange={e => {
                setTipoLocal(e.target.value);
                setLocalId(''); // Resetear local si cambia el tipo
                setSearchLocal('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            >
              <option value="">Cualquier Tipo</option>
              <option value="Supermercado">Supermercado</option>
              <option value="Distribuidora">Distribuidora</option>
              <option value="Tienda">Tienda</option>
              <option value="Mini Super">Mini Super</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-sm font-bold text-slate-600">Punto de Venta (Local)</label>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            />
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                {locales.filter(l => {
                  if (l.activo === false) return false;
                  if (filtroVendedor === 'sin_vendedor') {
                    if (l.vendedor_id !== null) return false;
                  } else if (filtroVendedor && l.vendedor_id !== filtroVendedor) {
                    return false;
                  }
                  if (tipoLocal && l.tipo !== tipoLocal) return false;
                  if (searchLocal && !l.nombre_local.toLowerCase().includes(searchLocal.toLowerCase())) return false;
                  return true;
                }).map(l => (
                  <div 
                    key={l.id} 
                    className="px-4 py-2 hover:bg-pink-50 cursor-pointer text-sm font-medium text-slate-700"
                    onClick={() => {
                      setLocalId(l.id);
                      setSearchLocal(l.nombre_local);
                      setShowDropdown(false);
                    }}
                  >
                    {l.nombre_local} <span className="text-xs text-slate-400">({l.tipo})</span>
                  </div>
                ))}
                {locales.filter(l => {
                  if (l.activo === false) return false;
                  if (filtroVendedor === 'sin_vendedor' && l.vendedor_id !== null) return false;
                  if (filtroVendedor && filtroVendedor !== 'sin_vendedor' && l.vendedor_id !== filtroVendedor) return false;
                  if (tipoLocal && l.tipo !== tipoLocal) return false;
                  if (searchLocal && !l.nombre_local.toLowerCase().includes(searchLocal.toLowerCase())) return false;
                  return true;
                }).length === 0 && (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron locales.</div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Resultado de la Visita</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setEstadoVisita('con_compra')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${estadoVisita === 'con_compra' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500 hover:border-emerald-200'}`}
              >
                <CheckCircle2 className={`w-6 h-6 ${estadoVisita === 'con_compra' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-center leading-tight">Visitado<br/>Con Compra</span>
              </button>
              <button 
                type="button"
                onClick={() => setEstadoVisita('sin_compra')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${estadoVisita === 'sin_compra' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 bg-white text-slate-500 hover:border-amber-200'}`}
              >
                <XCircle className={`w-6 h-6 ${estadoVisita === 'sin_compra' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-center leading-tight">Visitado<br/>Sin Compra</span>
              </button>
            </div>
          </div>

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
  );
}
