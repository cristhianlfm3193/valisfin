'use client';

import { useState, useRef } from 'react';
import { addMaintenanceLog } from '@/app/actions/vehicles';

export default function AddMaintenanceModal({ 
  isOpen, 
  onClose, 
  vehicles 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  vehicles: any[];
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.id || '');
  const [serviceDesc, setServiceDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

  const currentVehicleObj = vehicles.find(v => v.id === selectedVehicle);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    
    try {
      const formData = new FormData(formRef.current);
      await addMaintenanceLog(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-outline-subtle transform scale-100 transition-all duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006655]">ValisFin Fleet</span>
            <h3 className="text-xl font-extrabold text-on-surface">Registrar Mantenimiento</h3>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Selector de Vehículo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehículo</label>
            <div className="grid grid-cols-2 gap-2">
              {vehicles.map((v, i) => (
                <button 
                  key={v.id}
                  type="button" 
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 ${
                    selectedVehicle === v.id 
                      ? 'border-emerald-600 bg-emerald-50 text-[#006655]' 
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedVehicle === v.id ? 'bg-[#006655]' : 'bg-slate-400'}`}></span>
                  {v.brand} {v.model} ({v.year})
                </button>
              ))}
              <input type="hidden" name="vehicle_id" value={selectedVehicle} />
            </div>
          </div>

          {/* Chips de selección rápida */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Servicios frecuentes sugeridos</label>
            <div className="flex flex-wrap gap-1.5">
              {['Aceite y Filtro OEM', 'Alineación y Balanceo', 'Frenos / Pastillas', 'Batería', 'Revisado & Placa'].map(serv => (
                <button 
                  key={serv}
                  type="button" 
                  onClick={() => setServiceDesc(serv)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-[#006655] hover:border-emerald-300 border border-slate-200 transition-colors"
                >
                  {serv}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Descripción del trabajo realizado</label>
            <input 
              name="service"
              type="text" 
              value={serviceDesc}
              onChange={e => setServiceDesc(e.target.value)}
              required
              placeholder="Ej: Cambio de aceite 10W-30 sintético..." 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kilometraje actual</label>
              <input 
                name="km"
                type="number" 
                defaultValue={currentVehicleObj?.current_km || ''}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Próximo KM (alerta)</label>
              <input 
                name="next_km"
                type="number" 
                defaultValue={(currentVehicleObj?.current_km || 0) + 5000}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Costo (B/.)</label>
              <input 
                name="cost"
                type="number" 
                step="0.01"
                required
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fecha</label>
              <input 
                name="date"
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Taller / Local</label>
              <input 
                name="shop"
                type="text" 
                placeholder="Ej: Excel, Chen..." 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
              />
            </div>
          </div>

          {/* Registrado Por */}
          <input type="hidden" name="user_id" value="edc938dc-9fbc-4573-b007-0bdb95114f95" />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-full text-xs font-bold bg-[#006655] hover:bg-[#005144] text-white shadow-md shadow-emerald-900/10 transition-all disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
