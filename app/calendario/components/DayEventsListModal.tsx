import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { CalendarEvent } from '@/app/actions/calendario';

interface DayEventsListModalProps {
  date: string | null;
  events: CalendarEvent[];
  categoryStyles: any;
  onEventClick: (event: CalendarEvent) => void;
  onClose: () => void;
}

export function DayEventsListModal({ date, events, categoryStyles, onEventClick, onClose }: DayEventsListModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!date || !mounted) return null;

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
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto flex flex-col max-h-[85vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-slate-50">
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight capitalize">{formatDate(date)}</h3>
              <p className="text-xs text-slate-500">{events.length} eventos programados</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-2 custom-scrollbar">
            {events.map(event => {
              const style = categoryStyles[event.category] || categoryStyles['Recordatorios'];
              return (
                <div 
                  key={event.id}
                  onClick={() => {
                    onEventClick(event);
                  }}
                  className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between gap-3 cursor-pointer transition-transform hover:-translate-y-[1px] shadow-sm
                    ${style.bg} ${style.text} ${style.border} ${event.isCompleted ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`}></span>
                    <span className={`truncate ${event.isCompleted ? 'line-through' : ''}`}>
                      {event.title}
                    </span>
                  </div>
                  {event.amount && (
                    <span className="shrink-0 text-xs font-bold opacity-80">
                      {event.category === 'Ingresos' || event.category === 'Metas' ? '+' : '-'}B/. {event.amount}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
