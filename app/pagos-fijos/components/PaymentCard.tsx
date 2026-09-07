'use client';

import { Check, Edit2, Eye } from 'lucide-react';

export interface FixedPayment {
  id: string;
  category: string;
  is_paid: boolean;
  responsible: string;
  title: string;
  amount: number;
  subtitle: string;
  period?: string;
  isSmartCard?: boolean;
  accumulatedSpent?: number;
  billing_day?: number | null;
}

interface PaymentCardProps {
  payment: FixedPayment;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onPartialPayment?: () => void;
  onEdit?: () => void;
  onViewHistory?: () => void;
}

export function PaymentCard({ payment, onToggleStatus, onPartialPayment, onEdit, onViewHistory }: PaymentCardProps) {
  const { id, is_paid, responsible, title, amount, subtitle } = payment;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus(id, is_paid);
  };

  const formattedAmount = `B/. ${amount.toFixed(2)}`;

  if (payment.isSmartCard) {
    const spent = payment.accumulatedSpent || 0;
    const progressPct = amount > 0 ? Math.min(Math.max((spent / amount) * 100, 0), 100) : 0;
    
    return (
      <article className="payment-card bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="border-l-4 border-indigo-400 -ml-4 -mt-4 pl-4 pt-4 pb-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                Presupuesto Variable {payment.period ? `• ${payment.period}` : ''} {payment.billing_day ? `• Día ${payment.billing_day}` : ''}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h4 className="text-base font-bold text-slate-900 item-title">{title}</h4>
                {onEdit && (
                  <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar límite">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onViewHistory && (
                  <button onClick={(e) => { e.stopPropagation(); onViewHistory(); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Ver historial">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                Automático
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-indigo-100/50 flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-500 font-medium">Gastado: <strong className="text-slate-900">B/. {spent.toFixed(2)}</strong></span>
            <span className="text-xs text-slate-500 font-medium">Límite: <strong className="text-slate-900">{formattedAmount}</strong></span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progressPct >= 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Se alimenta automáticamente desde tus Gastos Diarios.
          </p>
          
          {title === 'Uso Tarjeta de Credito' && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-indigo-100/50">
              {onPartialPayment && (
                <button
                  onClick={(e) => { e.stopPropagation(); onPartialPayment(); }}
                  disabled={payment.accumulatedSpent ? payment.accumulatedSpent <= 0 : false}
                  className={`pay-toggle-btn min-h-[44px] flex-1 px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center focus:outline-none ${
                    (payment.accumulatedSpent && payment.accumulatedSpent <= 0)
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-100/50 hover:bg-indigo-100 text-indigo-700 focus:ring-2 focus:ring-indigo-300'
                  }`}
                  type="button"
                >
                  <span>Abonar</span>
                </button>
              )}
              <button
                onClick={handleToggle}
                disabled={payment.accumulatedSpent ? payment.accumulatedSpent <= 0 : false}
                className={`pay-toggle-btn min-h-[44px] flex-[2] px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 focus:outline-none ${
                  (payment.accumulatedSpent && payment.accumulatedSpent <= 0)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-2 focus:ring-emerald-500'
                }`}
                type="button"
              >
                <span className="btn-text">Pagar Total</span>
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }

  if (is_paid) {
    return (
      <article className="payment-card bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden">
        <div className="border-l-4 border-emerald-500 -ml-4 -mt-4 pl-4 pt-4 pb-1 status-stripe">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                {responsible} {payment.period ? `• ${payment.period}` : ''} {payment.billing_day ? `• Día ${payment.billing_day}` : ''}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h4 className="text-base font-bold text-slate-900 item-title">{title}</h4>
                {onEdit && (
                  <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onViewHistory && (
                  <button onClick={(e) => { e.stopPropagation(); onViewHistory(); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Ver historial">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
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
              {responsible} {payment.period ? `• ${payment.period}` : ''} {payment.billing_day ? `• Día ${payment.billing_day}` : ''}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h4 className="text-base font-bold text-slate-900 item-title">{title}</h4>
              {onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onViewHistory && (
                <button onClick={(e) => { e.stopPropagation(); onViewHistory(); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Ver historial">
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
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
