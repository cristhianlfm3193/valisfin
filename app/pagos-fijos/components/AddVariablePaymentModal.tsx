'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircle, Wallet, X, Check } from 'lucide-react';
import { addVariablePayment } from '@/app/actions/fixed_payments';

export function AddVariablePaymentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceTitle, setServiceTitle] = useState('Luz (Electricidad)');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const res = await addVariablePayment(formData);
      
      if (res.success) {
        setIsOpen(false);
      } else {
        alert('Error guardando el registro: ' + res.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const getNextMonths = () => {
    const months = [];
    const date = new Date();
    for (let i = -1; i < 6; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const y = d.getFullYear();
      const name = d.toLocaleString('es-ES', { month: 'long' });
      months.push({ value: `${y}-${m}`, label: `${name.charAt(0).toUpperCase() + name.slice(1)} ${y}` });
    }
    return months;
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[110] pointer-events-none p-4">
        <div 
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl pointer-events-auto transform transition-all flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Servicio Variable</h3>
                <p className="text-sm text-slate-500">Electricidad, Gasolina, Supermercado...</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="add-variable-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                {/* Servicio Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Tipo de Servicio / Gasto *
                  </label>
                  <select
                    name="title"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block px-4 py-3 outline-none transition-all appearance-none"
                  >
                    <option value="Luz (Electricidad)">Electricidad (Luz)</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Supermercado">Supermercado</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Monto a pagar *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-medium">B/.</span>
                      <input
                        type="number"
                        name="amount"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block pl-10 pr-4 py-3 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Period */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Mes Asignado *
                    </label>
                    <select
                      name="period"
                      required
                      defaultValue={getNextMonths()[1].value} // Default to current month
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block px-4 py-3 outline-none transition-all appearance-none"
                    >
                      {getNextMonths().map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 rounded-b-3xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="add-variable-form"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Guardando...' : 'Guardar Gasto'}</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition hover:shadow-md active:scale-95"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Servicio Variable</span>
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}
