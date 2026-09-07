'use client';

import { useRef, useEffect, useActionState, useState } from 'react';
import { updateCompletedMaintenance } from '../../actions/vehicles';

export default function EditCompletedModal({ 
  isOpen, 
  onClose, 
  task 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  task: any | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(updateCompletedMaintenance, { success: false, error: '' });

  const [service, setService] = useState('');
  const [cost, setCost] = useState('');
  const [shop, setShop] = useState('');
  const [date, setDate] = useState('');
  const [km, setKm] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setService(task.service || '');
      setCost(task.cost ? task.cost.toString() : '');
      setShop(task.shop || '');
      setDate(task.date || '');
      setKm(task.km ? task.km.toString() : '');
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (state?.success) {
      onClose();
    } else if (state?.error) {
      alert(state.error);
    }
  }, [state, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006655] flex items-center justify-center">
              <span className="material-symbols-outlined">edit</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">Editar Registro</h3>
              <p className="text-xs text-slate-500">Modifica los detalles del historial</p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form ref={formRef} action={formAction} className="space-y-5">
            <input type="hidden" name="id" value={task.id} />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Trabajo Realizado</label>
              <input 
                type="text" 
                name="service" 
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Fecha</label>
                <input 
                  type="date" 
                  name="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Kilometraje</label>
                <input 
                  type="number" 
                  name="km" 
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Costo (B/.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">B/.</span>
                <input 
                  type="number" 
                  name="cost" 
                  step="0.01" 
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-lg font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Taller <span className="text-slate-400 font-normal">(Opcional)</span></label>
              <input 
                type="text"
                name="shop"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="Nombre del taller o lugar"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isPending || !service}
                className="w-full py-3.5 px-4 bg-[#006655] hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
