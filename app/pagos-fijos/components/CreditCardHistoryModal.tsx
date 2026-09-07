'use client';

import { useState, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, ArrowDownRight, ArrowUpRight, Edit2, Trash2 } from 'lucide-react';
import { DailyExpense, deleteDailyExpense } from '@/app/actions/daily_expenses';
import { deleteFixedPayment, updateFixedPaymentAmount } from '@/app/actions/fixed_payments';
import { FixedPayment } from './PaymentCard';

interface CreditCardHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: DailyExpense[];
  payments: FixedPayment[];
  onEditExpense?: (expense: DailyExpense) => void;
}

export function CreditCardHistoryModal({ isOpen, onClose, expenses, payments, onEditExpense }: CreditCardHistoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  // Filter credit card expenses and sort by date descending
  const ccExpenses = expenses
    .filter(e => e.is_credit_card)
    .map(e => ({
      id: e.id,
      date: new Date(e.date),
      title: e.detail,
      category: e.category,
      amount: e.amount,
      type: 'expense' as const,
      person: e.profiles?.first_name || 'Desconocido',
      originalExpense: e
    }));

  // Filter paid credit card fixed payments and sort by date descending
  // Since fixedPayments doesn't have a reliable paid_at date right now, we use created_at or just date them today for simplicity
  // Assuming they are recent if they are paid.
  const ccPayments = payments
    .filter(p => p.is_paid && p.title === 'Uso Tarjeta de Credito')
    .map(p => ({
      id: p.id,
      date: new Date((p as any).created_at || Date.now()), // Fallback to now if no created_at
      title: 'Abono / Pago Total',
      category: 'Pago',
      amount: p.amount,
      type: 'payment' as const,
      person: p.responsible
    }));

  const allHistory = [...ccExpenses, ...ccPayments].sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalSpent = ccExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = ccPayments.reduce((sum, item) => sum + item.amount, 0);
  const totalDebt = totalSpent - totalPaid;

  const handleDelete = (id: string, type: 'expense' | 'payment') => {
    if (confirm(`¿Estás seguro de que deseas eliminar este ${type === 'expense' ? 'gasto' : 'abono'}?`)) {
      startTransition(async () => {
        if (type === 'expense') {
          await deleteDailyExpense(id);
        } else {
          await deleteFixedPayment(id);
        }
      });
    }
  };

  const handleEditPayment = (id: string, currentAmount: number) => {
    const newVal = window.prompt('Nuevo monto del abono:', currentAmount.toString());
    if (newVal !== null) {
      const newAmount = parseFloat(newVal);
      if (!isNaN(newAmount) && newAmount > 0) {
        startTransition(async () => {
          await updateFixedPaymentAmount(id, newAmount);
        });
      } else {
        alert('Monto inválido.');
      }
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
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Historial de Tarjeta</h3>
                <p className="text-xs text-slate-500">Consumos y abonos registrados</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50">
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Deuda Actual</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 font-mono">B/. {totalDebt.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gastado</p>
                <p className="text-lg sm:text-xl font-bold text-rose-500 font-mono">B/. {totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Abonado</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-500 font-mono">B/. {totalPaid.toFixed(2)}</p>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-3 ml-1">Movimientos</h4>
            
            <div className="space-y-2.5">
              {allHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-white rounded-2xl border border-slate-100">
                  <p className="text-sm">No hay movimientos registrados en esta tarjeta.</p>
                </div>
              ) : (
                allHistory.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="bg-white border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        {item.type === 'expense' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0 justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className={`font-bold font-mono ${item.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {item.type === 'expense' ? '-' : '+'} B/. {item.amount.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                          {item.person}
                        </p>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex flex-col gap-1 ml-2 border-l border-slate-100 pl-3">
                        <button 
                          disabled={isPending}
                          onClick={() => {
                            if (item.type === 'expense' && item.originalExpense && onEditExpense) {
                              onEditExpense(item.originalExpense);
                            } else if (item.type === 'payment') {
                              handleEditPayment(item.id, item.amount);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          disabled={isPending}
                          onClick={() => handleDelete(item.id, item.type)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
