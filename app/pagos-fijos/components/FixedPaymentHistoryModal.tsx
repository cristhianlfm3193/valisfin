'use client';

import { useState, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Trash2, Edit2 } from 'lucide-react';
import { FixedPayment } from './PaymentCard';
import { deleteFixedPayment, updateFixedPaymentAmount } from '@/app/actions/fixed_payments';

interface FixedPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: FixedPayment[];
  title: string;
}

export function FixedPaymentHistoryModal({ isOpen, onClose, payments, title }: FixedPaymentHistoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  // Filter payments for the specific title
  const historyPayments = payments
    .filter(p => (p.title === title || p.title === 'Electricidad Naturgy' || p.title === 'Naturgy') && p.is_paid && (title === 'Naturgy' || title === 'Electricidad Naturgy' ? true : p.title === title))
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

  const handleDelete = (id: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar este pago?`)) {
      startTransition(async () => {
        await deleteFixedPayment(id);
      });
    }
  };

  const handleEditPayment = (id: string, currentAmount: number) => {
    const newVal = window.prompt('Nuevo monto del pago:', currentAmount.toString());
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
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Historial de {title}</h3>
                <p className="text-xs text-slate-500">Pagos y abonos registrados</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Movimientos
              </h4>

              {historyPayments.length > 0 ? (
                <div className="space-y-3">
                  {historyPayments.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-emerald-200 transition-colors shadow-sm"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            Abono / Pago
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                              Pago
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(item.created_at || '').toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0 justify-between sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="font-bold font-mono text-emerald-500">
                            + B/. {item.amount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                            {item.id?.substring(0, 8)}
                          </p>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex flex-col gap-1 ml-2 border-l border-slate-100 pl-3">
                          <button 
                            disabled={isPending}
                            onClick={() => handleEditPayment(item.id, item.amount)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            disabled={isPending}
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No hay pagos registrados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
