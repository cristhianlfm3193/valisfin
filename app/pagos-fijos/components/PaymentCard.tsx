'use client';

import { Check } from 'lucide-react';

export interface FixedPayment {
  id: string;
  category: string;
  is_paid: boolean;
  responsible: string;
  title: string;
  amount: number;
  subtitle: string;
  period?: string;
}

interface PaymentCardProps {
  payment: FixedPayment;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onPartialPayment?: () => void;
}

export function PaymentCard({ payment, onToggleStatus, onPartialPayment }: PaymentCardProps) {
  const { id, is_paid, responsible, title, amount, subtitle } = payment;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus(id, is_paid);
  };

  const formattedAmount = `B/. ${amount.toFixed(2)}`;

  if (is_paid) {
    return (
      <article className="payment-card bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden">
        <div className="border-l-4 border-emerald-500 -ml-4 -mt-4 pl-4 pt-4 pb-1 status-stripe">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                {responsible} {payment.period ? `• ${payment.period}` : ''}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5 item-title">{title}</h4>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 status-pill">
                Pagado ✓
              </span>
              <p className="text-lg font-extrabold text-slate-900 mt-1 item-amount">{formattedAmount}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between gap-2">
          <span className="text-xs text-emerald-700 font-medium">{subtitle}</span>
          <button
            onClick={handleToggle}
            className="pay-toggle-btn min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-medium tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-slate-300 focus:outline-none"
            type="button"
          >
            <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
            <span className="btn-text text-emerald-800 font-semibold">Pagado (Deshacer)</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="payment-card bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between relative overflow-hidden">
      <div className="border-l-4 border-rose-500 -ml-4 -mt-4 pl-4 pt-4 pb-1 status-stripe">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              {responsible} {payment.period ? `• ${payment.period}` : ''}
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-0.5 item-title">{title}</h4>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 status-pill">
              Pendiente
            </span>
            <p className="text-lg font-extrabold text-slate-900 mt-1 item-amount">{formattedAmount}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
        <span className="text-xs text-slate-600 font-medium">{subtitle}</span>
        <div className="flex items-center gap-2">
          {onPartialPayment && amount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onPartialPayment(); }}
              className="pay-toggle-btn min-h-[44px] flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center focus:ring-2 focus:ring-slate-300 focus:outline-none"
              type="button"
            >
              <span>Abonar</span>
            </button>
          )}
          <button
            onClick={handleToggle}
            className="pay-toggle-btn min-h-[44px] flex-[2] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            type="button"
          >
            <span className="btn-text">Pagar Total</span>
          </button>
        </div>
      </div>
    </article>
  );
}
