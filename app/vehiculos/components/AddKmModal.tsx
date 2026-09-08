'use client';

import { useState, useRef } from 'react';
import { addMileageLog } from '@/app/actions/vehicles';

export default function AddKmModal({ 
  isOpen, 
  onClose, 
  vehicles 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  vehicles: any[];
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.id || '');
  const [kmValue, setKmValue] = useState(vehicles[0]?.current_km || 0);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

  const currentVehicleObj = vehicles.find(v => v.id === selectedVehicle);

  const handleVehicleChange = (val: string) => {
    setSelectedVehicle(val);
    const v = vehicles.find(vh => vh.id === val);
    if (v) {
      setKmValue(v.current_km + 300);
    }
  };

  const incrementKm = (amount: number) => {
    setKmValue((prev: number) => (typeof prev === 'number' ? prev + amount : amount));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    
    try {
      const formData = new FormData(formRef.current);
      await addMileageLog(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-200">
      <div className="max-h-[90vh] overflow-y-auto custom-scrollbar bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-subtle transform scale-100 transition-all duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006655]">Lectura de Odómetro</span>
            <h3 className="text-xl font-extrabold text-on-surface">Registrar Kilometraje</h3>
          </div>
          <button onClick={onClose} type="button" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehículo a actualizar</label>
            <select 
              name="vehicle_id"
              value={selectedVehicle}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} (Lectura ant: {v.current_km.toLocaleString()} km)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nueva lectura de odómetro</label>
            <div className="relative">
              <input 
                name="km"
                type="number" 
                value={kmValue}
                onChange={(e) => setKmValue(parseInt(e.target.value) || 0)}
                required
                className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-2xl font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">KM</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Incremento rápido sugerido</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => incrementKm(300)} className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006655] font-mono text-xs font-bold border border-emerald-200 transition-colors">+300 km</button>
              <button type="button" onClick={() => incrementKm(500)} className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006655] font-mono text-xs font-bold border border-emerald-200 transition-colors">+500 km</button>
              <button type="button" onClick={() => incrementKm(1000)} className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006655] font-mono text-xs font-bold border border-emerald-200 transition-colors">+1,000 km</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Conductor / Registrado por</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="radio" name="user_id" value="edc938dc-9fbc-4573-b007-0bdb95114f95" defaultChecked className="text-[#006655] focus:ring-[#006655]" />
                <span className="text-xs font-semibold text-slate-800">Cristhian Fuentes</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="radio" name="user_id" value="7b5c62be-58f1-48d6-b366-0f504c39bdcb" className="text-[#006655] focus:ring-[#006655]" />
                <span className="text-xs font-semibold text-slate-800">Jennifer Camaño</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-full text-xs font-bold bg-[#006655] hover:bg-[#005144] text-white shadow-md shadow-emerald-900/10 transition-all disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Lectura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
