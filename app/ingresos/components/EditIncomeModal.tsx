'use client';

import { useState } from 'react';
import { Pencil, X, Check, Trash2 } from 'lucide-react';
import { editIncome, deleteIncome } from '@/app/actions/income';

export function EditIncomeModal({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [person, setPerson] = useState(item.person);
  const [category, setCategory] = useState(item.category);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set('person', person);
    
    try {
      const result = await editIncome(item.id, formData);
      if (result.success) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (confirm("¿Estás seguro de que deseas eliminar este ingreso?")) {
      setIsLoading(true);
      try {
        await deleteIncome(item.id);
        // It will unmount, no need to close modal if it's deleted
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }
  }

  // format date from YYYY-MM-DD for input default
  const defaultDate = item.date_expected ? item.date_expected.split('T')[0] : '';

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition shrink-0"
        title="Editar Ingreso"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
            <div className="sticky top-0 bg-white/80 backdrop-blur border-b border-slate-100 p-5 sm:p-6 flex items-center justify-between z-10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Editar Ingreso</h3>
                  <p className="text-xs text-slate-500 font-medium">Modifica los detalles del registro</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
              {/* 1. Selección de Persona */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  ¿De quién es el ingreso? <span className="text-emerald-600">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    person === 'cristhian' 
                      ? 'border-emerald-600 bg-emerald-50 shadow-sm' 
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}>
                    <input 
                      type="radio" 
                      name="person" 
                      value="cristhian" 
                      checked={person === 'cristhian'}
                      onChange={() => setPerson('cristhian')}
                      className="sr-only" 
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      person === 'cristhian' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>CF</div>
                    <div>
                      <div className={`text-sm font-bold leading-tight ${person === 'cristhian' ? 'text-emerald-900' : 'text-slate-700'}`}>Cristhian</div>
                      <div className={`text-[11px] font-medium ${person === 'cristhian' ? 'text-emerald-800' : 'text-slate-500'}`}>Salario & Gastos</div>
                    </div>
                  </label>

                  <label className={`relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    person === 'jennifer' 
                      ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}>
                    <input 
                      type="radio" 
                      name="person" 
                      value="jennifer" 
                      checked={person === 'jennifer'}
                      onChange={() => setPerson('jennifer')}
                      className="sr-only" 
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      person === 'jennifer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>JC</div>
                    <div>
                      <div className={`text-sm font-bold leading-tight ${person === 'jennifer' ? 'text-indigo-900' : 'text-slate-700'}`}>Jennifer</div>
                      <div className={`text-[11px] font-medium ${person === 'jennifer' ? 'text-indigo-800' : 'text-slate-500'}`}>Salario, Carro & Bonos</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. Tipo y Quincena */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Categoría / Tipo */}
                <div>
                  <label htmlFor="edit-income-category" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Tipo de Ingreso <span className="text-emerald-600">*</span>
                  </label>
                  <select 
                    id="edit-income-category" 
                    name="income-category" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="salario">Salario Quincenal</option>
                    {person === 'cristhian' && <option value="representacion">Gasto de Representación</option>}
                    {person === 'jennifer' && <option value="carro">Gasto de Carro / Movilidad</option>}
                    <option value="bono">Bono por Objetivos</option>
                    <option value="extra">Ingreso Extraordinario / Consultoría</option>
                  </select>
                </div>

                {/* Período / Quincena */}
                <div>
                  <label htmlFor="edit-income-period" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Período Asignado <span className="text-emerald-600">*</span>
                  </label>
                  <select 
                    id="edit-income-period" 
                    name="income-period" 
                    defaultValue={item.period}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="q1">1ra Quincena (1 al 15)</option>
                    <option value="q2">2da Quincena (16 al 30/31)</option>
                    <option value="eventual">Ingreso Eventual / Todo el mes</option>
                  </select>
                </div>
              </div>

              {/* 3. Concepto o Descripción */}
              <div>
                <label htmlFor="edit-income-title" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Concepto o Descripción <span className="text-emerald-600">*</span>
                </label>
                <input 
                  type="text" 
                  id="edit-income-title" 
                  name="income-title" 
                  required 
                  defaultValue={item.description}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* 4. Monto (Balboas) y Fecha de Cobro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Monto */}
                <div>
                  <label htmlFor="edit-income-amount" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Monto a Cobrar <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-500 text-sm pointer-events-none">
                      B/.
                    </span>
                    <input 
                      type="number" 
                      step="0.01" 
                      id="edit-income-amount" 
                      name="income-amount" 
                      required 
                      defaultValue={item.amount}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Fecha Prevista */}
                <div>
                  <label htmlFor="edit-income-date" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Fecha de Cobro / Depósito <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      id="edit-income-date" 
                      name="income-date" 
                      required 
                      defaultValue={defaultDate}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-700/20 hover:shadow-amber-700/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
