'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Receipt, Save } from 'lucide-react';
import { addDailyExpense } from '@/app/actions/daily_expenses';

interface AddDailyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDailyExpenseModal({ isOpen, onClose }: AddDailyExpenseModalProps) {
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
      const result = await addDailyExpense(formData);
      
      if (result.success) {
        onClose();
      } else {
        alert(result.error || 'Error al guardar el gasto');
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar el gasto');
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[110] pointer-events-none p-4">
        <div 
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registrar Gasto</h3>
                <p className="text-xs text-slate-500">Nuevo egreso cotidiano</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 overflow-y-auto">
            <form id="add-daily-expense-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Fecha */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={today}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block px-4 py-3 outline-none transition-all"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Categoría
                </label>
                <select
                  name="category"
                  required
                  defaultValue="Alimentación"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block px-4 py-3 outline-none transition-all appearance-none"
                >
                  <option value="Supermercado">Supermercado</option>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Restaurante">Restaurante</option>
                  <option value="Ocio">Ocio</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Salud">Salud</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              {/* Detalle / Comercio */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Detalle o Comercio
                </label>
                <input
                  type="text"
                  name="detail"
                  required
                  placeholder="Ej. Súper 99, McDonalds, Cine..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block px-4 py-3 outline-none transition-all"
                />
              </div>

              {/* Persona */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Pagador
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative flex items-center justify-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all">
                    <input type="radio" name="person" value="Cristhian" className="peer sr-only" required defaultChecked />
                    <span className="font-semibold text-sm text-slate-700 peer-checked:text-emerald-700">Cristhian</span>
                  </label>
                  <label className="relative flex items-center justify-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all">
                    <input type="radio" name="person" value="Jennifer" className="peer sr-only" required />
                    <span className="font-semibold text-sm text-slate-700 peer-checked:text-emerald-700">Jennifer</span>
                  </label>
                </div>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-medium">B/.</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-base rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block pl-10 pr-4 py-3 outline-none transition-all"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
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
              form="add-daily-expense-form"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-70"
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
