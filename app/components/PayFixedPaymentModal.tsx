'use client';

import { useState, useTransition, useMemo } from 'react';
import { X, Calendar, DollarSign, Wallet } from 'lucide-react';
import { togglePaymentStatus, partialPayment as partialPaymentAction } from '@/app/actions/fixed_payments';

interface PayFixedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixedPayments: any[];
}

export function PayFixedPaymentModal({ isOpen, onClose, fixedPayments }: PayFixedPaymentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'total' | 'abono'>('total');
  const [abonoAmount, setAbonoAmount] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  // Solamente mostrar pagos que no han sido pagados
  const pendingPayments = useMemo(() => {
    return fixedPayments
      .filter(p => !p.is_paid)
      // Agrupar visualmente por periodo si se desea, o simplemente mostrarlos
      .sort((a, b) => {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
      });
  }, [fixedPayments]);

  const selectedPayment = pendingPayments.find(p => p.id === selectedPaymentId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedPayment) {
      setErrorMsg('Debe seleccionar una obligación.');
      return;
    }

    startTransition(async () => {
      try {
        if (paymentMode === 'total') {
          // Pago Total
          await togglePaymentStatus([selectedPayment.id], false);
          onClose();
        } else {
          // Abono Parcial
          const amount = parseFloat(abonoAmount);
          if (isNaN(amount) || amount <= 0) {
            setErrorMsg('Ingrese un monto válido para el abono.');
            return;
          }
          if (amount >= selectedPayment.amount) {
            setErrorMsg('El abono debe ser menor al monto total. Use Pago Total en su lugar.');
            return;
          }
          
          const res = await partialPaymentAction(selectedPayment.id, amount);
          if (res?.success === false) {
            setErrorMsg(res.error || 'Error al procesar el abono.');
          } else {
            onClose();
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Ocurrió un error inesperado.');
      }
    });
  };

  const handleClose = () => {
    if (isPending) return;
    setAbonoAmount('');
    setSelectedPaymentId('');
    setPaymentMode('total');
    setErrorMsg('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity z-40 flex items-center justify-center p-3 sm:p-4" 
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden z-50 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Pago de Gasto Fijo</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Registra el pago de una obligación pendiente</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-5 sm:py-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Seleccionar Obligación Pendiente <span className="text-violet-600">*</span>
            </label>
            <select
              value={selectedPaymentId}
              onChange={(e) => setSelectedPaymentId(e.target.value)}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all appearance-none"
              required
            >
              <option value="" disabled>-- Elige una obligación --</option>
              {pendingPayments.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.period ? `(${p.period})` : ''} - B/. {p.amount.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {selectedPayment && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">Monto total a pagar:</span>
                <span className="text-sm font-bold text-slate-900">B/. {selectedPayment.amount.toFixed(2)}</span>
              </div>

              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Tipo de Pago <span className="text-violet-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('total')}
                  disabled={isPending}
                  className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors ${
                    paymentMode === 'total' 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Pago Total
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('abono')}
                  disabled={isPending}
                  className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors ${
                    paymentMode === 'abono' 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Abonar Parte
                </button>
              </div>

              {paymentMode === 'abono' && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Monto a Abonar (B/.) <span className="text-violet-600">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={abonoAmount}
                      onChange={(e) => setAbonoAmount(e.target.value)}
                      disabled={isPending}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer CTA */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={handleClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedPaymentId}
              className="px-6 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-sm shadow-md shadow-violet-700/20 hover:shadow-violet-700/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              {isPending ? 'Guardando...' : (paymentMode === 'total' ? 'Registrar Pago Total' : 'Registrar Abono')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
