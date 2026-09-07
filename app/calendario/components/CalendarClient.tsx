'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarEvent } from '@/app/actions/calendario';
import { AddReminderModal } from './AddReminderModal';
import { EventDetailsModal } from './EventDetailsModal';
import { DayEventsListModal } from './DayEventsListModal';
import { 
  ChevronLeft, ChevronRight, Plus, Download, RefreshCw, Calendar as CalendarIcon
} from 'lucide-react';

interface CalendarClientProps {
  initialEvents: CalendarEvent[];
  currentMonth: number;
  currentYear: number;
}

const CATEGORY_STYLES = {
  'Ingresos': { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-200', dot: 'bg-emerald-600', icon: '💵' },
  'Pagos Fijos': { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', dot: 'bg-indigo-600', icon: '⚡' },
  'Gastos Diarios': { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', dot: 'bg-rose-500', icon: '🛒' },
  'Vehículos': { bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-200', dot: 'bg-sky-500', icon: '🚗' },
  'Hogar': { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', dot: 'bg-amber-500', icon: '🏡' },
  'Metas': { bg: 'bg-teal-50', text: 'text-teal-900', border: 'border-teal-200', dot: 'bg-teal-500', icon: '🎯' },
  'Recordatorios': { bg: 'bg-pink-50', text: 'text-pink-900', border: 'border-pink-200', dot: 'bg-pink-500', icon: '🔔' },
};

export function CalendarClient({ initialEvents, currentMonth, currentYear }: CalendarClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('Todos');

  const [viewType, setViewType] = useState<'Año' | 'Mes' | 'Día'>('Mes');
  const [activeDateStr, setActiveDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const navigate = (direction: -1 | 1) => {
    if (viewType === 'Mes' || viewType === 'Año') {
      let newMonth = currentMonth + direction;
      let newYear = currentYear;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      router.push(`/calendario?month=${newMonth}&year=${newYear}`);
    } else if (viewType === 'Día') {
      const d = new Date(activeDateStr);
      d.setDate(d.getDate() + direction);
      setActiveDateStr(d.toISOString().split('T')[0]);
    }
  };

  const navigateToToday = () => {
    const d = new Date();
    setActiveDateStr(d.toISOString().split('T')[0]);
    router.push(`/calendario?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
    if (viewType === 'Año') setViewType('Mes');
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const previousMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

  const days = [];
  
  // Previous month trailing days
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: previousMonthDays - i, isCurrentMonth: false, fullDate: null });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, isCurrentMonth: true, fullDate: dStr });
  }

  // Next month leading days
  const remainingCells = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ day: i, isCurrentMonth: false, fullDate: null });
  }

  const filteredEvents = filter === 'Todos' ? initialEvents : initialEvents.filter(e => e.category === filter);

  const eventsByDate = filteredEvents.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Calendario Financiero Familiar</h1>
            <p className="text-xs text-slate-500 mt-0.5">Agenda unificada de fechas de cobro, vencimiento de pagos y metas patrimoniales.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm shadow-brand-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Recordatorio / Compromiso</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
              <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition shadow-xs">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-800 select-none capitalize">
                {viewType === 'Mes' && `${monthNames[currentMonth - 1]} ${currentYear}`}
                {viewType === 'Año' && `${currentYear}`}
                {viewType === 'Día' && new Intl.DateTimeFormat('es-PA', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(activeDateStr))}
              </span>
              <button onClick={() => navigate(1)} className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition shadow-xs">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button onClick={navigateToToday} className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
              Hoy
            </button>
          </div>
          
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs font-bold">
            <button 
              onClick={() => setViewType('Año')} 
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewType === 'Año' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>Año</button>
            <button 
              onClick={() => setViewType('Mes')} 
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewType === 'Mes' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>Mes</button>
            <button 
              onClick={() => setViewType('Día')} 
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewType === 'Día' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>Día</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-slate-50/50">
        
        {/* Filters */}
        <section className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
            <button 
              onClick={() => setFilter('Todos')}
              className={`px-3 py-1.5 rounded-full font-bold shadow-xs whitespace-nowrap transition-colors ${filter === 'Todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Todos ({initialEvents.length})
            </button>
            
            {Object.keys(CATEGORY_STYLES).map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition whitespace-nowrap
                  ${filter === cat ? CATEGORY_STYLES[cat as keyof typeof CATEGORY_STYLES].bg + ' ' + CATEGORY_STYLES[cat as keyof typeof CATEGORY_STYLES].text + ' ' + CATEGORY_STYLES[cat as keyof typeof CATEGORY_STYLES].border : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <span className={`w-2 h-2 rounded-full ${CATEGORY_STYLES[cat as keyof typeof CATEGORY_STYLES].dot}`}></span>
                <span>{CATEGORY_STYLES[cat as keyof typeof CATEGORY_STYLES].icon} {cat}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Grid or List depending on View */}
        {viewType === 'Mes' && (
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="grid grid-cols-7 border-b border-slate-200 text-center py-2.5 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
              <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div className="text-slate-700">Sáb</div><div className="text-slate-700">Dom</div>
            </div>
            
            <div className="grid grid-cols-7 border-b border-slate-100 divide-x divide-y divide-slate-100 flex-1">
              {days.map((d, i) => {
                const isToday = d.fullDate === todayStr;
                const dayEvents = d.fullDate ? (eventsByDate[d.fullDate] || []) : [];

                return (
                  <div key={i} className={`min-h-[100px] md:min-h-[120px] p-2 flex flex-col justify-between transition-colors
                    ${!d.isCurrentMonth ? 'bg-slate-50/40 text-slate-400' : 'hover:bg-slate-50/50 text-slate-700'}
                    ${isToday ? 'bg-emerald-50/30 ring-2 ring-inset ring-brand-500 rounded-lg relative z-10' : ''}
                  `}>
                    <div className="flex justify-between items-start">
                      {isToday ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">{d.day}</span>
                          <span className="text-[9px] font-bold text-brand-700 uppercase tracking-tight hidden lg:inline">Hoy</span>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold ${d.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>{d.day}</span>
                      )}
                    </div>
                    
                    <div className="space-y-1 mt-1 flex-1 overflow-y-auto custom-scrollbar">
                      {dayEvents.slice(0, 3).map(event => {
                        const style = CATEGORY_STYLES[event.category as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES['Recordatorios'];
                        return (
                          <div 
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`px-1.5 py-0.5 md:py-1 rounded-md border text-[9px] md:text-[10px] font-semibold truncate flex items-center gap-1 cursor-pointer transition-transform hover:-translate-y-[1px] shadow-sm
                              ${style.bg} ${style.text} ${style.border} ${event.isCompleted ? 'opacity-50 line-through' : ''}
                            `}
                            title={event.title}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}></span>
                            <span className="truncate">
                              {event.time ? `${event.time.substring(0, 5)} ` : ''}
                              {event.title} 
                              {event.amount && ` (${event.category === 'Ingresos' || event.category === 'Metas' ? '+' : '-'}B/. ${event.amount})`}
                            </span>
                          </div>
                        )
                      })}
                      
                      {dayEvents.length > 3 && (
                        <button 
                          onClick={() => setSelectedDay(d.fullDate)}
                          className="w-full text-left px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          + {dayEvents.length - 3} más...
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {viewType === 'Año' && (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthNames.map((month, index) => (
              <button
                key={month}
                onClick={() => {
                  router.push(`/calendario?month=${index + 1}&year=${currentYear}`);
                  setViewType('Mes');
                }}
                className={`p-6 bg-white rounded-2xl border transition-all text-center group
                  ${index + 1 === currentMonth ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20' : 'border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md'}
                `}
              >
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-brand-600 transition-colors">
                  {currentYear}
                </div>
                <div className="text-2xl font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors">
                  {month}
                </div>
              </button>
            ))}
          </section>
        )}

        {viewType === 'Día' && (
          <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm min-h-[400px]">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100 capitalize">
              Eventos del {new Intl.DateTimeFormat('es-PA', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(activeDateStr))}
            </h2>
            
            {(!eventsByDate[activeDateStr] || eventsByDate[activeDateStr].length === 0) ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <CalendarIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Sin datos programados</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">No hay ingresos, pagos fijos, recordatorios ni mantenimientos para este día.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 px-4 py-2 bg-brand-50 text-brand-700 font-bold text-sm rounded-xl hover:bg-brand-100 transition-colors"
                >
                  Agregar evento aquí
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsByDate[activeDateStr].map(event => {
                  const style = CATEGORY_STYLES[event.category as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES['Recordatorios'];
                  return (
                    <div 
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-4 rounded-xl border text-sm font-semibold flex flex-col gap-2 cursor-pointer transition-transform hover:-translate-y-[2px] shadow-sm
                        ${style.bg} ${style.text} ${style.border} ${event.isCompleted ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{style.icon}</span>
                          <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                        </div>
                        {event.amount && (
                          <span className="text-sm font-bold bg-white/50 px-2 py-1 rounded-md">
                            {event.category === 'Ingresos' || event.category === 'Metas' ? '+' : '-'}B/. {event.amount}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <h4 className={`text-base font-extrabold ${event.isCompleted ? 'line-through' : ''}`}>
                          {event.title}
                        </h4>
                        <p className="text-xs opacity-80 uppercase tracking-widest mt-1 font-bold">
                          {event.category} {event.time ? `• ${event.time.substring(0, 5)}` : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <AddReminderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <DayEventsListModal 
        date={selectedDay} 
        events={selectedDay ? eventsByDate[selectedDay] : []} 
        categoryStyles={CATEGORY_STYLES}
        onEventClick={(ev) => {
          setSelectedEvent(ev);
        }}
        onClose={() => setSelectedDay(null)} 
      />
      <EventDetailsModal 
        event={selectedEvent} 
        onClose={() => {
          setSelectedEvent(null);
          // It will automatically drop back to DayEventsListModal if selectedDay is set, 
          // because DayEventsListModal is still rendered behind it.
        }} 
      />
    </div>
  );
}
