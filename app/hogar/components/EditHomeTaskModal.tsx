'use client';

import { useState, useActionState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { updateHomeTask } from '@/app/actions/home';

export default function EditHomeTaskModal({ task, isOpen, onClose }: { task: any, isOpen: boolean, onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(updateHomeTask, null);
  const [selectedProfile, setSelectedProfile] = useState(task?.profile_id || 'edc938dc-9fbc-4573-b007-0bdb95114f95');

  // Sync state if task changes while modal is open or if it wasn't unmounted
  useEffect(() => {
    if (task?.profile_id) {
      setSelectedProfile(task.profile_id);
    }
  }, [task]);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0">
          <div className="space-y-1">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>Edición de Trabajo
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight mt-1">Editar Trabajo</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={formAction} className="flex-1 flex flex-col overflow-hidden">
          <input type="hidden" name="id" value={task.id} />
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {state?.error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
                {state.error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Área / Ubicación</label>
              <select name="area" required defaultValue={task.area} className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm">
                <option value="Sala / Comedor">🛋️ Sala / Comedor</option>
                <option value="Baño de Visitas">🚿 Baño de Visitas</option>
                <option value="Patio / Techo">🏡 Patio / Techo</option>
                <option value="Recámara Principal">🛏️ Recámara Principal</option>
                <option value="Cocina">🍳 Cocina</option>
                <option value="Área de Lavandería">🧺 Área de Lavandería</option>
                <option value="Entrada Principal">🚪 Entrada Principal</option>
                <option value="General / Otro">📦 General / Otro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tipo de Trabajo</label>
              <input name="title" required type="text" defaultValue={task.title} className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 font-medium placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Detalles</label>
              <textarea name="description" defaultValue={task.description || ''} rows={2} className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 font-medium placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Fecha Estimada</label>
                <input name="estimated_date" type="date" required defaultValue={task.estimated_date ? task.estimated_date.split('T')[0] : ''} className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Presupuesto / Costo Final</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-500">B/.</span>
                  </div>
                  <input name="budget" type="number" step="0.01" min="0" defaultValue={task.budget || ''} className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-slate-900 font-bold placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Responsable</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="relative flex items-center justify-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all">
                    <input type="radio" name="profile_id" value="edc938dc-9fbc-4573-b007-0bdb95114f95" onChange={() => setSelectedProfile('edc938dc-9fbc-4573-b007-0bdb95114f95')} checked={selectedProfile === 'edc938dc-9fbc-4573-b007-0bdb95114f95'} className="peer sr-only" required />
                    <span className="font-semibold text-sm text-slate-700 peer-checked:text-emerald-700">Cristhian</span>
                  </label>
                  <label className="relative flex items-center justify-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 peer-checked:border-pink-400 peer-checked:bg-pink-50 transition-all">
                    <input type="radio" name="profile_id" value="7b5c62be-58f1-48d6-b366-0f504c39bdcb" onChange={() => setSelectedProfile('7b5c62be-58f1-48d6-b366-0f504c39bdcb')} checked={selectedProfile === '7b5c62be-58f1-48d6-b366-0f504c39bdcb'} className="peer sr-only" required />
                    <span className="font-semibold text-sm text-slate-700 peer-checked:text-pink-600">Jennifer</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Estado Actual</label>
                <select name="status" required defaultValue={task.status} className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-800 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm">
                  <option value="Pendiente">⏳ Pendiente</option>
                  <option value="En Proceso">🔄 En Proceso</option>
                  <option value="Completado">✅ Completado</option>
                </select>
                <input type="hidden" name="priority" value={task.priority} />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors min-h-[40px]"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 min-h-[40px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                'Guardando...'
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
