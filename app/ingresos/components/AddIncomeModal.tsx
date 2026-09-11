'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Wallet, X, Check } from 'lucide-react';
import { addIncome } from '@/app/actions/income';
import { Btn3D } from '@/app/components/Btn3D';

export function AddIncomeModal({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  initialData
}: {
  isOpen?: boolean;
  onClose?: () => void;
  initialData?: any;
} = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [person, setPerson] = useState<'cristhian' | 'jennifer'>('cristhian');
  const [category, setCategory] = useState('extra');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    if (initialData) {
      if (initialData.pagador) {
        setPerson(initialData.pagador.toLowerCase() as 'cristhian' | 'jennifer');
      }
      if (initialData.categoria) {
        setCategory('extra'); // default for quick entry
      }
    }
  }, [initialData]);

  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    else setInternalIsOpen(false);
  };

  if (!isOpen && externalIsOpen === undefined) {
    return (
      <button 
        onClick={() => setInternalIsOpen(true)}
        className="inline-flex items-center gap-2 bg-emerald-700 text-white hover:bg-emerald-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition hover:shadow-md active:scale-95"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Ingreso eventual</span>
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity z-[100] flex items-center justify-center p-3 sm:p-4" 
        aria-hidden="true"
        onClick={handleClose}
      >
        {/* Modal Dialog Window */}
        <div 
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100/80 max-h-[90vh] overflow-y-auto custom-scrollbar z-50 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <header className="px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-b from-slate-50/80 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Registrar Ingreso</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Añade una quincena, bono o ingreso eventual al flujo</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Modal Form Body */}
          <form 
            className="px-6 sm:px-8 py-5 sm:py-6 space-y-5" 
            action={async (formData) => {
              setIsLoading(true);
              try {
                // Since fields might be disabled/readonly, we can ensure they are in formData 
                // but readOnly inputs are submitted normally.
                // Wait, if an input is disabled or readOnly but we need its value, we should make sure it's passed.
                // readOnly inputs ARE passed in formData.
                const res = await addIncome(formData);
                if (res && res.success === false) {
                  alert("Error de base de datos: " + res.error);
                } else {
                  handleClose();
                }
              } catch (e) {
                console.error(e);
                alert("Hubo un error de conexión al guardar.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            
            {/* 1. Responsable / Cónyuge */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                ¿Quién recibe el ingreso? <span className="text-emerald-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Cristhian Option */}
                <label 
                  className={`cursor-pointer relative flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    person === 'cristhian' 
                      ? 'border-2 border-emerald-600 bg-emerald-50/50 shadow-sm' 
                      : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="profile_id" 
                    value="edc938dc-9fbc-4573-b007-0bdb95114f95" 
                    checked={person === 'cristhian'} 
                    onChange={() => { setPerson('cristhian'); }}
                    className="sr-only" 
                  />
                  <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 shadow-sm ${
                    person === 'cristhian' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    CF
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm leading-tight ${person === 'cristhian' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>Cristhian Fuentes</div>
                  </div>
                  {person === 'cristhian' && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-600"></span>}
                </label>

                {/* Jennifer Option */}
                <label 
                  className={`cursor-pointer relative flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    person === 'jennifer' 
                      ? 'border-2 border-emerald-600 bg-emerald-50/50 shadow-sm' 
                      : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="profile_id" 
                    value="7b5c62be-58f1-48d6-b366-0f504c39bdcb" 
                    checked={person === 'jennifer'} 
                    onChange={() => { setPerson('jennifer'); }}
                    className="sr-only" 
                  />
                  <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 shadow-sm ${
                    person === 'jennifer' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    JC
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm leading-tight ${person === 'jennifer' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>Jennifer Camaño</div>
                  </div>
                  {person === 'jennifer' && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-600"></span>}
                </label>
              </div>
            </div>

            {/* 2. Tipo y Quincena */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Categoría / Tipo */}
              <div>
                <label htmlFor="income-category" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tipo de Ingreso <span className="text-emerald-600">*</span>
                </label>
                <select 
                  id="income-category" 
                  name="income-category" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="bono">Bono por Objetivos</option>
                  <option value="extra">Ingreso Extraordinario / Consultoría</option>
                </select>
              </div>

              {/* Período / Quincena */}
              <div>
                <label htmlFor="income-period" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Período Asignado <span className="text-emerald-600">*</span>
                </label>
                <select id="income-period" name="income-period" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all">
                  <option value="q1">1ra Quincena (1 al 15)</option>
                  <option value="q2">2da Quincena (16 al 30/31)</option>
                  <option value="eventual">Ingreso Eventual / Todo el mes</option>
                </select>
              </div>
            </div>

            {/* 3. Concepto o Descripción */}
            <div>
              <label htmlFor="income-title" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Concepto o Descripción <span className="text-emerald-600">*</span>
              </label>
              <input 
                type="text" 
                id="income-title" 
                name="income-title" 
                required 
                placeholder="Ej. Venta de artículo" 
                key={`title-${category}-${person}`}
                defaultValue={initialData?.detalle || ''}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500" 
              />
            </div>

            {/* 4. Monto (Balboas) y Fecha de Cobro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monto */}
              <div>
                <label htmlFor="income-amount" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Monto a Cobrar <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-500 text-sm pointer-events-none">
                    B/.
                  </span>
                  <input 
                    type="number" 
                    step="0.01" 
                    id="income-amount" 
                    name="income-amount" 
                    required 
                    placeholder="0.00" 
                    key={`amount-${category}-${person}`}
                    defaultValue={initialData?.monto || ''}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500" 
                  />
                </div>
              </div>

              {/* Fecha Prevista */}
              <div>
                <label htmlFor="income-date" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Fecha de Cobro / Depósito <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    id="income-date" 
                    name="income-date" 
                    required 
                    suppressHydrationWarning
                    defaultValue={initialData?.fecha || (isOpen ? new Date().toISOString().split('T')[0] : '')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <Btn3D type="button" color="gray" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Btn3D>
              <Btn3D type="submit" color="emerald" isLoading={isLoading} loadingText="Guardando..." disabled={isLoading}>
                Guardar
              </Btn3D>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
