'use client';

import { useRef, useState, useEffect, useActionState } from 'react';
import { addPendingMaintenance } from '../../actions/vehicles';
import { Btn3D } from '@/app/components/Btn3D';

const SUGGESTIONS = [
  "Cambio de Llantas (Desgaste)",
  "Banda de Tiempo (Correa)",
  "Cambio de Amortiguadores",
  "Fuga de aceite / refrigerante",
  "Batería con bajo voltaje",
  "Pastillas de freno gastadas"
];

export default function AddPendingModal({ 
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
  const [service, setService] = useState('');
  const [cost, setCost] = useState('');
  
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(addPendingMaintenance, { success: false, error: '' });

  // Get current km of selected vehicle
  const currentKm = vehicles.find(v => v.id === selectedVehicle)?.current_km || 0;

  useEffect(() => {
    if (state?.success) {
      setService('');
      setCost('');
      onClose();
    } else if (state?.error) {
      alert(state.error);
    }
  }, [state, onClose]);

  useEffect(() => {
    if (initialData && isOpen) {
      if (initialData.vehiculo) {
        const match = vehicles.find(v => 
          v.brand.toLowerCase().includes(initialData.vehiculo.toLowerCase()) || 
          v.model.toLowerCase().includes(initialData.vehiculo.toLowerCase())
        );
        if (match) setSelectedVehicle(match.id);
      }
      if (initialData.mantenimiento_tipo) {
        setService(initialData.mantenimiento_tipo);
      }
      if (initialData.costo_estimado) {
        setCost(initialData.costo_estimado.toString());
      }
    }
  }, [initialData, isOpen, vehicles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined">assignment_late</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">Trabajo Pendiente</h3>
              <p className="text-xs text-slate-500">Registra un mantenimiento sugerido</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form ref={formRef} action={formAction} className="space-y-5">
            <input type="hidden" name="current_km" value={currentKm} />
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Vehículo</label>
              <div className="grid grid-cols-2 gap-3">
                {vehicles.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicle(v.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      selectedVehicle === v.id 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {v.brand === 'Toyota' ? 'directions_car' : 'airport_shuttle'}
                    </span>
                    <span className="truncate">{v.brand} {v.model}</span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="vehicle_id" value={selectedVehicle} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">¿Qué trabajo está pendiente?</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTIONS.map(sug => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setService(sug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      service === sug ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
              <input 
                type="text" 
                name="service" 
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="O escribe otro trabajo manual..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Costo Estimado <span className="text-slate-400 font-normal">(Opcional)</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">B/.</span>
                <input 
                  type="number" 
                  name="cost" 
                  step="0.01" 
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-lg font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-500">Si no tienes el precio ahora, puedes dejarlo en blanco.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Observaciones <span className="text-slate-400 font-normal">(Opcional)</span></label>
              <textarea 
                name="notes"
                rows={2}
                placeholder="Agrega algún detalle o recomendación del mecánico..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm resize-none"
              ></textarea>
            </div>

            <div className="pt-2">
              <Btn3D type="submit" color="blue" isLoading={isPending} loadingText="Guardando..." disabled={isPending || !service}>
                Guardar Tarea Pendiente
              </Btn3D>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
