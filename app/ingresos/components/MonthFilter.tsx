'use client';

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
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

  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    updateUrl(newYear, newMonth);
  };

  const handleNextMonth = () => {
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
    router.push(`?${params.toString()}`);
  };

  const monthName = MONTHS[currentMonth];

  return (
    <div className="flex items-center bg-white shadow-sm rounded-full p-1 border border-slate-200">
      <button 
        onClick={handlePrevMonth}
        aria-label="Mes anterior" 
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="px-3 flex items-center gap-1.5 text-sm text-slate-700 font-medium min-w-[140px] justify-center">
        <CalendarDays className="text-emerald-700 w-4 h-4" />
        <span className="font-semibold capitalize">{monthName} {currentYear}</span>
      </div>
      
      <button 
        onClick={handleNextMonth}
        aria-label="Mes siguiente" 
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
