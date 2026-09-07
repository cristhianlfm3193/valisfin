import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, DollarSign, Tag, Info } from 'lucide-react';
import { CalendarEvent } from '@/app/actions/calendario';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!event || !mounted) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('es-PA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  };

  const modalContent = (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[110] pointer-events-none p-4">
        <div 
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">Detalles del Evento</h3>
                <p className="text-xs text-slate-500">{event.category}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h4 className="text-xl font-extrabold text-slate-900">{event.title}</h4>
              <p className="text-sm font-medium text-slate-500 mt-1 capitalize">{formatDate(event.date)}</p>
            </div>

            <div className="space-y-3">
              {event.amount !== undefined && event.amount !== null && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monto</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(event.amount)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Tag className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría</p>
                  <p className="text-sm font-bold text-slate-900">{event.category}</p>
                </div>
              </div>

              {event.time && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hora</p>
                    <p className="text-sm font-bold text-slate-900">{event.time.substring(0, 5)}</p>
                  </div>
                </div>
              )}
            </div>

            {event.isCompleted && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-700">Este evento ya está completado / pagado</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
