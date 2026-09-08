'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Calendar, DollarSign } from 'lucide-react';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, billingDay: number | null, title: string, profile_id?: string) => Promise<void>;
  currentAmount: number;
  currentBillingDay?: number | null;
  currentProfileId?: string;
  title: string;
  isVariable: boolean;
}

export function EditPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  currentAmount,
  currentBillingDay,
  currentProfileId,
  title,
  isVariable
}: EditPaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState(currentAmount.toString());
  const [billingDay, setBillingDay] = useState(currentBillingDay ? currentBillingDay.toString() : '');
  const [profileId, setProfileId] = useState(currentProfileId || 'edc938dc-9fbc-4573-b007-0bdb95114f95');
  const [editedTitle, setEditedTitle] = useState(title);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount.toString());
      setBillingDay(currentBillingDay ? currentBillingDay.toString() : '');
      setProfileId(currentProfileId || 'edc938dc-9fbc-4573-b007-0bdb95114f95');
      setEditedTitle(title);
    }
  }, [isOpen, currentAmount, currentBillingDay, currentProfileId, title]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const parsedAmount = parseFloat(amount);
      const parsedDay = billingDay ? parseInt(billingDay, 10) : null;
      await onSubmit(parsedAmount, parsedDay, editedTitle, profileId);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al guardar los cambios');
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
          className="max-h-[90vh] overflow-y-auto custom-scrollbar bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Editar {title}</h3>
              <p className="text-xs text-slate-500">
                {isVariable ? 'Ajustar límite mensual y fecha' : 'Ajustar monto y fecha de cobro'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5">
            <form id="edit-payment-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nombre de la Obligación
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editedTitle}
                    onChange={e => setEditedTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-base rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block px-4 py-3 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {isVariable ? 'Límite Mensual' : 'Monto Fijo'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-medium">B/.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-lg rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block pl-10 pr-4 py-3 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Billing Day */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Día de Cobro (1-31)
                </label>
                <div className="relative">
                  <Calendar className="absolute inset-y-0 left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billingDay}
                    onChange={e => setBillingDay(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-base rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block pl-12 pr-4 py-3 outline-none transition-all"
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">Dejar en blanco si no aplica o es variable.</p>
              </div>

              {/* Persona */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Responsable del Pago
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative flex items-center justify-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all">
                    <input type="radio" name="profile_id" value="edc938dc-9fbc-4573-b007-0bdb95114f95" className="peer sr-only" required checked={profileId === 'edc938dc-9fbc-4573-b007-0bdb95114f95'} onChange={() => setProfileId('edc938dc-9fbc-4573-b007-0bdb95114f95')} />
                    <span className="font-semibold text-sm text-slate-700 peer-checked:text-emerald-700">Cristhian</span>
                  </label>
                  <label className="relative flex items-center justify-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 peer-checked:border-pink-400 peer-checked:bg-pink-50 transition-all">
                    <input type="radio" name="profile_id" value="7b5c62be-58f1-48d6-b366-0f504c39bdcb" className="peer sr-only" required checked={profileId === '7b5c62be-58f1-48d6-b366-0f504c39bdcb'} onChange={() => setProfileId('7b5c62be-58f1-48d6-b366-0f504c39bdcb')} />
                    <span className="font-semibold text-sm text-slate-700 peer-checked:text-pink-600">Jennifer</span>
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 rounded-b-3xl shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-payment-form"
              disabled={isLoading || !amount}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
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
