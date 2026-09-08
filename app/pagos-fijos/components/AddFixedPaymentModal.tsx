'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Save } from 'lucide-react';
import { createFixedPayment } from '@/app/actions/fixed_payments';

interface AddFixedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFixedPaymentModal({ isOpen, onClose }: AddFixedPaymentModalProps) {
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
      const result = await createFixedPayment(formData);
      
      if (result.success) {
        onClose();
      } else {
        alert(result.error || 'Error al guardar la obligación');
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar la obligación');
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
              <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Añadir Obligación</h3>
                <p className="text-xs text-slate-500">Nuevo pago fijo mensual</p>
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
            <form id="add-fixed-payment-form" onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nombre de la Obligación
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Ej. Netflix, Préstamo Personal..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 block px-4 py-3 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Día de Cobro (Del 1 al 31)
                </label>
                <input
                  type="number"
                  name="billing_day"
                  min="1"
                  max="31"
                  required
                  placeholder="Ej. 15"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 block px-4 py-3 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Monto Mensual
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
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-base rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 block pl-10 pr-4 py-3 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Persona */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Responsable del Pago
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative flex items-center justify-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all">
                    <input type="radio" name="profile_id" value="edc938dc-9fbc-4573-b007-0bdb95114f95" className="peer sr-only" required defaultChecked />
                    <span className="font-semibold text-sm text-slate-700 peer-checked:text-emerald-700">Cristhian</span>
                  </label>
                  <label className="relative flex items-center justify-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 peer-checked:border-pink-400 peer-checked:bg-pink-50 transition-all">
                    <input type="radio" name="profile_id" value="7b5c62be-58f1-48d6-b366-0f504c39bdcb" className="peer sr-only" required />
                    <span className="font-semibold text-sm text-slate-700 peer-checked:text-pink-600">Jennifer</span>
                  </label>
                </div>
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
              form="add-fixed-payment-form"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-70"
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
