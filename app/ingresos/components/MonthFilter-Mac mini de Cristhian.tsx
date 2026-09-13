'use client';

import { useTransition } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface MonthFilterProps {
  currentYear: number;
  currentMonth: number; // 0-11
}

export function MonthFilter({ currentYear, currentMonth }: MonthFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePrevMonth = () => {
    if (isPending) return;
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    updateUrl(newYear, newMonth);
  };

  const handleNextMonth = () => {
    if (isPending) return;
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    updateUrl(newYear, newMonth);
  };

  const updateUrl = (year: number, month: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year.toString());
    params.set('month', month.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const monthName = MONTHS[currentMonth];

  return (
    <div className="flex items-center bg-[#121c27] border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] rounded-full p-1 border border-white/10">
      <button 
        onClick={handlePrevMonth}
        disabled={isPending}
        aria-label="Mes anterior" 
        className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isPending ? 'text-slate-300 cursor-not-allowed' : 'text-gray-400 hover:bg-white/10 active:bg-slate-200'}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className={`px-3 flex items-center gap-1.5 text-sm font-medium min-w-[140px] justify-center transition-opacity ${isPending ? 'opacity-60 text-gray-400' : 'text-gray-300'}`}>
        {isPending ? (
          <Loader2 className="text-emerald-700 w-4 h-4 animate-spin" />
        ) : (
          <CalendarDays className="text-emerald-700 w-4 h-4" />
        )}
        <span className="font-semibold capitalize">{monthName} {currentYear}</span>
      </div>
      
      <button 
        onClick={handleNextMonth}
        disabled={isPending}
        aria-label="Mes siguiente" 
        className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isPending ? 'text-slate-300 cursor-not-allowed' : 'text-gray-400 hover:bg-white/10 active:bg-slate-200'}`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
