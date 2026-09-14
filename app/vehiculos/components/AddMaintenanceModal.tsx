'use client';

import { useState, useRef, useEffect } from 'react';
import { addMaintenanceLog } from '@/app/actions/vehicles';
import { Btn3D } from '@/app/components/Btn3D';

export default function AddMaintenanceModal({ 
  isOpen, 
  onClose, 
  vehicles,
  initialData,
  uniqueServices = []
}: { 
  isOpen: boolean; 
  onClose: () => void;
  vehicles: any[];
  initialData?: any;
  uniqueServices?: string[];
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.id || '');
  const [serviceDesc, setServiceDesc] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('Preventivo');
  const [kmVal, setKmVal] = useState('');
  const [nextKmVal, setNextKmVal] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const currentVehicleObj = vehicles.find(v => v.id === selectedVehicle);

  useEffect(() => {
    if (isOpen) {
      setServiceDesc('');
      setMaintenanceType('Preventivo');
      let initKm = '';
      if (initialData) {
        if (initialData.vehiculo) {
          const match = vehicles.find(v => 
            v.brand.toLowerCase().includes(initialData.vehiculo.toLowerCase()) || 
            v.model.toLowerCase().includes(initialData.vehiculo.toLowerCase())
          );
          if (match) setSelectedVehicle(match.id);
        }
        if (initialData.mantenimiento_tipo) {
          setServiceDesc(initialData.mantenimiento_tipo);
        }
        initKm = initialData.km_lectura || '';
      } else {
        initKm = currentVehicleObj?.current_km?.toString() || '';
      }
      setKmVal(initKm);
      setNextKmVal(initKm ? (Number(initKm) + 5000).toString() : '');
    }
  }, [initialData, isOpen, vehicles, currentVehicleObj?.current_km]);

  if (!isOpen) return null;

  const handleKmChange = (val: string) => {
    setKmVal(val);
    if (maintenanceType === 'Preventivo' && val) {
      setNextKmVal((Number(val) + 5000).toString());
    }
  };

  const handleTypeChange = (type: string) => {
    setMaintenanceType(type);
    if (type === 'Preventivo' && kmVal) {
      setNextKmVal((Number(kmVal) + 5000).toString());
    }
  };

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
      <div className="max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#121c27] w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-outline-subtle transform scale-100 transition-all duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006655]">ValisFin Fleet</span>
            <h3 className="text-xl font-extrabold text-on-surface">Registrar Mantenimiento</h3>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Selector de Vehículo */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Vehículo</label>
            <div className="grid grid-cols-2 gap-2">
              {vehicles.map((v, i) => (
                <button 
                  key={v.id}
                  type="button" 
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 ${
                    selectedVehicle === v.id 
                      ? 'border-emerald-600 bg-emerald-50 text-[#006655]' 
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedVehicle === v.id ? 'bg-[#006655]' : 'bg-slate-400'}`}></span>
                  {v.brand} {v.model} ({v.year})
                </button>
              ))}
              <input type="hidden" name="vehicle_id" value={selectedVehicle} />
            </div>
          </div>

          {/* Tipo de Mantenimiento */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Tipo de Mantenimiento</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`cursor-pointer py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                maintenanceType === 'Preventivo' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}>
                <input type="radio" name="type" value="Preventivo" className="sr-only" checked={maintenanceType === 'Preventivo'} onChange={() => handleTypeChange('Preventivo')} />
                <span className="material-symbols-outlined text-[16px]">build</span>
                Preventivo
              </label>
              <label className={`cursor-pointer py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                maintenanceType === 'Correctivo' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}>
                <input type="radio" name="type" value="Correctivo" className="sr-only" checked={maintenanceType === 'Correctivo'} onChange={() => handleTypeChange('Correctivo')} />
                <span className="material-symbols-outlined text-[16px]">handyman</span>
                Correctivo
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Descripción del trabajo realizado</label>
            <input 
              name="service"
              type="text" 
              list="service-suggestions"
              value={serviceDesc}
              onChange={e => setServiceDesc(e.target.value)}
              required
              placeholder="Ej: Cambio de aceite 10W-30 sintético..." 
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-on-surface focus:outline-none focus:bg-[#121c27] focus:border-[#006655] transition-all" 
            />
            <datalist id="service-suggestions">
              {uniqueServices.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kilometraje actual</label>
              <input 
                name="km"
                type="number" 
                value={kmVal}
                onChange={(e) => handleKmChange(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:bg-[#121c27] focus:border-[#006655] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Próximo KM (alerta)
                <span className="ml-1 font-normal text-slate-400">— opcional</span>
              </label>
              <input 
                name="next_km"
                type="number" 
                value={nextKmVal}
                onChange={(e) => setNextKmVal(e.target.value)}
                placeholder={`Vacío = mantener alerta actual`}
                className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:bg-[#121c27] focus:border-[#006655] transition-all placeholder:text-slate-400 placeholder:text-xs" 
              />
              <p className="text-[10px] text-slate-400 mt-1">Suma 5k auto si es Preventivo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Costo (B/.)</label>
              <input 
                name="cost"
                type="number" 
                step="0.01"
                required
                defaultValue={initialData?.costo_estimado || ''}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-mono font-bold text-on-surface focus:outline-none focus:bg-[#121c27] focus:border-[#006655] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Fecha</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={initialData?.fecha || (isOpen ? new Date().toISOString().split('T')[0] : '')}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-on-surface focus:outline-none focus:bg-[#121c27] focus:border-[#006655] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Taller / Local</label>
              <input 
                name="shop"
                type="text" 
                placeholder="Ej: Excel, Chen..." 
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-on-surface focus:outline-none focus:bg-[#121c27] focus:border-[#006655] transition-all" 
              />
            </div>
          </div>

          {/* Registrado Por */}
          <input type="hidden" name="user_id" value="edc938dc-9fbc-4573-b007-0bdb95114f95" />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-xs font-semibold text-slate-400 hover:bg-white/10 transition-colors">Cancelar</button>
            <Btn3D type="submit" color="blue" isLoading={loading} loadingText="Guardando..." disabled={loading}>
              Guardar Servicio
            </Btn3D>
          </div>
        </form>
      </div>
    </div>
  );
}
