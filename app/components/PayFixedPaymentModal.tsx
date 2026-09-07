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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Pago de Obligación</h2>
              <p className="text-emerald-100 text-xs font-medium">Registra el pago de un gasto fijo</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            disabled={isPending}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium border border-rose-100">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Seleccionar Obligación Pendiente
            </label>
            <select
              value={selectedPaymentId}
              onChange={(e) => setSelectedPaymentId(e.target.value)}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
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

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tipo de Pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('total')}
                  disabled={isPending}
                  className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors ${
                    paymentMode === 'total' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
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
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Abonar Parte
                </button>
              </div>

              {paymentMode === 'abono' && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Monto a Abonar (B/.)
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
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold placeholder:font-normal"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || !selectedPaymentId}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            >
              {isPending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>{paymentMode === 'total' ? 'Registrar Pago Total' : 'Registrar Abono'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
