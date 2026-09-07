'use client';

import { useState, useRef } from 'react';
import { addACMaintenance } from '@/app/actions/ac';
import { Wind } from 'lucide-react';

export default function AddACMaintenanceModal({ 
  isOpen, 
  onClose,
  unit 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  unit: any;
}) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen || !unit) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    
    try {
      const formData = new FormData(formRef.current);
      formData.append('unit_id', unit.id);
      await addACMaintenance(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 transform scale-100 transition-all duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mantenimiento de A/C</span>
              <h3 className="text-lg font-extrabold text-slate-900">{unit.location}</h3>
            </div>
          </div>
          <button onClick={onClose} type="button" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Fecha del Mantenimiento</label>
            <input 
              name="maintenance_date"
              type="date" 
              required
              defaultValue={today}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Costo (B/.)</label>
            <input 
              name="cost"
              type="number" 
              step="0.01"
              required
              placeholder="Ej: 40.00"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Técnico / Empresa (Opcional)</label>
            <input 
              name="technician"
              type="text" 
              placeholder="Ej: Refrigeración Express"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-all" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Responsable / Pagado por</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="radio" name="profile_id" value="edc938dc-9fbc-4573-b007-0bdb95114f95" defaultChecked className="text-emerald-600 focus:ring-emerald-600" />
                <span className="text-xs font-semibold text-slate-800">Cristhian</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="radio" name="profile_id" value="7b5c62be-58f1-48d6-b366-0f504c39bdcb" className="text-pink-600 focus:ring-pink-600" />
                <span className="text-xs font-semibold text-slate-800">Jennifer</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/10 transition-all disabled:opacity-50">
              {loading ? 'Guardando...' : 'Registrar Mantenimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
