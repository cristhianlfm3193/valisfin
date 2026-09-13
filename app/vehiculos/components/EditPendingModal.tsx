'use client';

import { useRef, useEffect, useActionState, useState } from 'react';
import { Btn3D } from '@/app/components/Btn3D';
import { updatePendingMaintenance } from '../../actions/vehicles';

export default function EditPendingModal({ 
  isOpen, 
  onClose, 
  task 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  task: any | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(updatePendingMaintenance, { success: false, error: '' });

  const [service, setService] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setService(task.service || '');
      setCost(task.cost ? task.cost.toString() : '');
      setNotes(task.notes || '');
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
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined">edit</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">Editar Pendiente</h3>
              <p className="text-xs text-slate-500">Modifica los detalles del trabajo</p>
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
              <label className="block text-sm font-semibold text-slate-700">Trabajo a realizar</label>
              <input 
                type="text" 
                name="service" 
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Costo Estimado <span className="text-slate-400 font-normal">(Opcional)</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">B/.</span>
                <input 
                  type="number" 
                  name="cost" 
                  step="0.01" 
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-lg font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Observaciones</label>
              <textarea 
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm resize-none"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Btn3D
                type="button"
                color="gray"
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Btn3D>
              <Btn3D 
                type="submit" 
                color="orange"
                isLoading={isPending}
                loadingText="Guardando..."
                disabled={isPending || !service}
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Guardar Cambios
              </Btn3D>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
