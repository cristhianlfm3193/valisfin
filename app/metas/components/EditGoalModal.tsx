'use client';

import { useState, useRef, useEffect } from 'react';
import { updateSavingsGoal } from '@/app/actions/goals';
import { Btn3D } from '@/app/components/Btn3D';

export default function EditGoalModal({
  isOpen,
  onClose,
  goal
}: {
  isOpen: boolean;
  onClose: () => void;
  goal: any;
}) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && goal && formRef.current) {
      formRef.current.reset();
    }
  }, [isOpen, goal]);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    
    try {
      const formData = new FormData(formRef.current);
      formData.append('id', goal.id);
      await updateSavingsGoal(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto bg-slate-900/35 backdrop-blur-[4px]">
      <section aria-modal="true" className="max-h-[90vh] overflow-y-auto custom-scrollbar relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-fade-in transition-all" role="dialog">
        <button onClick={onClose} aria-label="Cerrar ventana emergente" className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500" type="button">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </button>

        <header className="px-5 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-5 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide uppercase mb-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Edición de Meta
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Editar o Aportar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg leading-relaxed">
            Actualiza los datos o registra un nuevo aporte a tu ahorro.
          </p>
        </header>

        <form ref={formRef} onSubmit={handleSubmit} className="px-5 py-5 sm:px-8 sm:py-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="goal-title">
              Nombre de la Meta / Objetivo
            </label>
            <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition" id="goal-title" name="goal-title" defaultValue={goal.title} required type="text"/>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="goal-category">
              Área / Categoría de la Meta
            </label>
            <div className="relative">
              <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition pr-10 cursor-pointer" id="goal-category" name="goal-category" defaultValue={goal.category} required>
                <option value="hogar">🏠 Hogar &amp; Mejoras / Reparaciones</option>
                <option value="vehiculos">🚗 Vehículos &amp; Movilidad</option>
                <option value="tecnologia">📱 Tecnología &amp; Equipos Personales</option>
                <option value="familia">❤️ Salud, Bienestar &amp; Familia</option>
                <option value="deudas">💳 Pago de Deudas &amp; Compromisos</option>
                <option value="viajes">✈️ Vacaciones, Paseos &amp; Ocio</option>
                <option value="educacion">🎓 Educación &amp; Capacitación</option>
                <option value="emergencia">🛡️ Fondo de Reserva / Emergencia</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="target-amount">
                Costo Total Objetivo
              </label>
              <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 bg-white flex items-center transition">
                <span className="pl-3.5 pr-1.5 text-sm font-bold text-slate-500 select-none">B/.</span>
                <input className="w-full border-0 bg-transparent py-3 pr-4 text-sm font-semibold text-slate-900 focus:ring-0 focus:outline-none disabled:opacity-50" id="target-amount" name="target-amount" defaultValue={goal.target_amount} required step="0.01" type="number" readOnly={!!goal.linked_vehicle_id} title={goal.linked_vehicle_id ? "El costo se calcula automáticamente de los mantenimientos pendientes." : undefined} />
              </div>
              {goal.linked_vehicle_id && (
                <p className="mt-1.5 text-[11px] text-emerald-600 font-medium">Este costo objetivo se calcula automáticamente según los mantenimientos pendientes del vehículo.</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="current-savings">
                Ahorro Actual (Aporta aquí)
              </label>
              <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 bg-white flex items-center transition">
                <span className="pl-3.5 pr-1.5 text-sm font-bold text-emerald-600 select-none">B/.</span>
                <input className="w-full border-0 bg-transparent py-3 pr-4 text-sm font-semibold text-emerald-700 focus:ring-0 focus:outline-none" id="current-savings" name="current-savings" defaultValue={goal.saved_amount} step="0.01" type="number" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="deadline">
                Fecha Límite Estimada
              </label>
              <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition" id="deadline" name="deadline" defaultValue={goal.deadline_date || ''} type="date" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="priority">
                Nivel de Prioridad
              </label>
              <div className="relative">
                <select className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition pr-10 cursor-pointer" id="priority" name="priority" defaultValue={goal.priority} required>
                  <option value="MUY ALTA">🔴 MUY ALTA</option>
                  <option value="ALTA">🟠 ALTA</option>
                  <option value="MEDIA">🟡 MEDIA</option>
                  <option value="BAJA">🟢 BAJA</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Responsable Principal
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-emerald-50/50 transition-colors">
                <input className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600" name="profile_id" value="edc938dc-9fbc-4573-b007-0bdb95114f95" type="radio" defaultChecked={goal.profile_id === 'edc938dc-9fbc-4573-b007-0bdb95114f95'} />
                <span className="text-sm font-bold text-slate-800">Cristhian</span>
              </label>
              <label className="relative flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-pink-50/50 transition-colors">
                <input className="w-4 h-4 text-pink-600 border-slate-300 focus:ring-pink-600" name="profile_id" value="7b5c62be-58f1-48d6-b366-0f504c39bdcb" type="radio" defaultChecked={goal.profile_id === '7b5c62be-58f1-48d6-b366-0f504c39bdcb'} />
                <span className="text-sm font-bold text-slate-800">Jennifer</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <Btn3D onClick={onClose} color="gray" type="button">
              Cancelar
            </Btn3D>
            <Btn3D disabled={loading} isLoading={loading} loadingText="Guardando..." color="emerald" type="submit">
              Actualizar Meta
            </Btn3D>
          </div>
        </form>
      </section>
    </div>
  );
}
