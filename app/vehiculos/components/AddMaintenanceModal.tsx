'use client';

import { useState, useRef, useEffect } from 'react';
import { addMaintenanceLog } from '@/app/actions/vehicles';
import { Btn3D } from '@/app/components/Btn3D';

export default function AddMaintenanceModal({ 
  isOpen, 
  onClose, 
  vehicles,
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  vehicles: any[];
  initialData?: any;
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]?.id || '');
  const [serviceDesc, setServiceDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      if (initialData.vehiculo) {
        const match = vehicles.find(v => 
          v.brand.toLowerCase().includes(initialData.vehiculo.toLowerCase()) || 
          v.model.toLowerCase().includes(initialData.vehiculo.toLowerCase())
        );
        if (match) {
          setSelectedVehicle(match.id);
        }
      }
      if (initialData.mantenimiento_tipo) {
        setServiceDesc(initialData.mantenimiento_tipo);
      }
    }
  }, [initialData, isOpen, vehicles]);

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
      <div className="max-h-[90vh] overflow-y-auto custom-scrollbar bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-outline-subtle transform scale-100 transition-all duration-200">
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
                defaultValue={initialData?.km_lectura || currentVehicleObj?.current_km || ''}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Próximo KM (alerta)
                <span className="ml-1 font-normal text-slate-400">— opcional</span>
              </label>
              <input 
                name="next_km"
                type="number" 
                placeholder={`Vacío = mantener alerta actual${currentVehicleObj ? ` (${(currentVehicleObj.km_service_alert || 'sin alerta')})` : ''}`}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all placeholder:text-slate-400 placeholder:text-xs" 
              />
              <p className="text-[10px] text-slate-400 mt-1">Deja en blanco si solo registras mantenimiento sin cambiar la alerta de aceite</p>
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
                defaultValue={initialData?.costo_estimado || ''}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-on-surface focus:outline-none focus:bg-white focus:border-[#006655] transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fecha</label>
              <input 
                type="date" 
                name="date"
                required
                defaultValue={initialData?.fecha || (isOpen ? new Date().toISOString().split('T')[0] : '')}
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
            <Btn3D type="submit" color="blue" isLoading={loading} loadingText="Guardando..." disabled={loading}>
              Guardar Servicio
            </Btn3D>
          </div>
        </form>
      </div>
    </div>
  );
}
