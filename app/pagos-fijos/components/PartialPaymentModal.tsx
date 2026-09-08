'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, X, Check } from 'lucide-react';
import { FixedPayment } from './PaymentCard';

interface PartialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  payment: FixedPayment | null;
}

export function PartialPaymentModal({ isOpen, onClose, onSubmit, payment }: PartialPaymentModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen || !payment) return null;

  const maxAmount = payment.amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }
    
    if (parsedAmount >= maxAmount) {
      alert(`Para pagar el total (${maxAmount}), usa el botón de "Pagar Total".`);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(parsedAmount);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error procesando el abono');
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
          className="max-h-[90vh] overflow-y-auto custom-scrollbar bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto transform transition-all flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Abonar</h3>
                <p className="text-xs text-slate-500">{payment.title}</p>
              </div>
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
            <form id="partial-payment-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Monto a Abonar
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-medium">B/.</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={maxAmount - 0.01}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-base rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block pl-10 pr-4 py-3 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Saldo total pendiente: <span className="font-semibold text-slate-700">B/. {maxAmount.toFixed(2)}</span>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="partial-payment-form"
              disabled={isLoading || !amount}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Procesar Abono</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
