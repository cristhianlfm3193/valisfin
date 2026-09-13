'use client';

import { useState } from 'react';
import { Wind, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AddACMaintenanceModal from './AddACMaintenanceModal';

export default function ACTracker({ acData }: { acData: any[] }) {
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusInfo = (nextDateStr: string) => {
    if (!nextDateStr) return { status: 'ok', text: 'Al día', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    
    const today = new Date();
    const next = new Date(nextDateStr);
    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', text: 'Atrasado', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    } else if (diffDays <= 30) {
      return { status: 'warning', text: 'Pronto', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { status: 'ok', text: 'Al día', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <>
      <section aria-label="Aires Acondicionados" className="px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2 mb-3">
          <Wind className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Mantenimiento de Aires Acondicionados</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {acData.map(unit => {
            const statusInfo = getStatusInfo(unit.latest_maintenance?.next_maintenance);
            
            return (
              <div key={unit.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm relative group hover:border-blue-200 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Wind className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{unit.location}</h4>
                        <p className="text-xs text-slate-500">{unit.name}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 mb-5">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Último
                      </p>
                      <p className="font-semibold text-slate-800 text-sm">
                        {unit.latest_maintenance ? formatDate(unit.latest_maintenance.maintenance_date) : 'Sin registro'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Próximo
                      </p>
                      <p className={`font-semibold text-sm ${statusInfo.status === 'overdue' ? 'text-rose-600' : statusInfo.status === 'warning' ? 'text-amber-600' : 'text-slate-800'}`}>
                        {unit.latest_maintenance ? formatDate(unit.latest_maintenance.next_maintenance) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUnit(unit)}
                  className="w-full py-2.5 bg-white border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Wind className="w-4 h-4" /> Registrar Mantenimiento
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <AddACMaintenanceModal 
        unit={selectedUnit} 
        isOpen={!!selectedUnit} 
        onClose={() => setSelectedUnit(null)} 
      />
    </>
  );
}
