'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, Save } from 'lucide-react';
import { addReminder } from '@/app/actions/calendario';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddReminderModal({ isOpen, onClose }: AddReminderModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const result = await addReminder(null, formData);
      
      if (result.success) {
        onClose();
      } else {
        alert(result.error || 'Error al agregar el recordatorio');
      }
    } catch (err) {
      console.error(err);
      alert('Error al agregar el recordatorio');
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[110] pointer-events-none p-4">
        <div 
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nuevo Recordatorio</h3>
                <p className="text-xs text-slate-500">Agrega un evento a tu calendario</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto">
            <form id="add-reminder-form" onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Ej: Pagar luz, Cita médica..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block px-4 py-3 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block px-4 py-3 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Hora (Opcional)
                </label>
                <input
                  type="time"
                  name="time"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block px-4 py-3 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Monto (Opcional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-medium">B/.</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-base rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block pl-10 pr-4 py-3 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Categoría
                </label>
                <select
                  name="category"
                  required
                  defaultValue="Recordatorios"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 block px-4 py-3 outline-none transition-all appearance-none"
                >
                  <option value="Recordatorios">🔔 Recordatorios</option>
                  <option value="Ingresos">💵 Ingresos & Cobros</option>
                  <option value="Pagos Fijos">⚡ Pagos Fijos & Servicios</option>
                  <option value="Vehículos">🚗 Vehículos & Mantenimiento</option>
                  <option value="Hogar">🏡 Hogar & Mejoras</option>
                  <option value="Metas">🎯 Metas de Ahorro</option>
                </select>
              </div>

            </form>
          </div>

          <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="add-reminder-form"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
