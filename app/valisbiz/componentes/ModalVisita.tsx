'use client';

import { useState, useTransition } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import type { Local, Vendedor } from '@/types/valisbiz';
import { registrarVisita } from '../acciones/crm';

interface ModalVisitaProps {
  onClose: () => void;
  locales: Local[];
  vendedores: Vendedor[];
  localInicial?: Local | null;
}

export default function ModalVisita({ onClose, locales, vendedores, localInicial }: ModalVisitaProps) {
  const [localId, setLocalId] = useState(localInicial?.id || '');
  const [vendedorId, setVendedorId] = useState('');
  const [estadoVisita, setEstadoVisita] = useState<'con_compra' | 'sin_compra' | ''>('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId || !vendedorId || !estadoVisita) return;
    
    startTransition(async () => {
      await registrarVisita({
        local_id: localId,
        vendedor_id: vendedorId,
        estado_visita: estadoVisita,
        fecha: new Date().toISOString().split('T')[0] // Hoy
      });
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Registrar Visita</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Punto de Venta (Local)</label>
            <select 
              required
              value={localId}
              onChange={e => setLocalId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            >
              <option value="">Selecciona un local...</option>
              {locales.map(l => (
                <option key={l.id} value={l.id}>{l.nombre_local}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Vendedor</label>
            <select 
              required
              value={vendedorId}
              onChange={e => setVendedorId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
            >
              <option value="">¿Quién realizó la visita?</option>
              {vendedores.map(v => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
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
              disabled={isPending || !localId || !vendedorId || !estadoVisita}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md shadow-slate-900/20"
            >
              {isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Guardar Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
