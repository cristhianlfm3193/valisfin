import Link from 'next/link';
import { getCalendarEvents } from '../actions/calendario';
import { CalendarClient } from './components/CalendarClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CalendarioPage(props: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const d = new Date();
  const currentMonth = searchParams.month ? parseInt(searchParams.month, 10) : d.getMonth() + 1;
  const currentYear = searchParams.year ? parseInt(searchParams.year, 10) : d.getFullYear();

  const events = await getCalendarEvents(currentYear, currentMonth);

  return (
    <>
      <header className="bg-[#090a0f]/90 backdrop-blur border-b border-white/10/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link href="/valisfin">
              <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-teal-400 via-emerald-400 to-pink-400 shadow-[0_0_10px_rgba(45,212,191,0.2)] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">V</span>
                  </div>
                </div>
                <span className="text-lg font-black text-white tracking-tight">
                  Valis<span className="text-emerald-400">Fin</span>
                </span>
              </div>
            </Link>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-l border-white/10 pl-3 ml-1">
              Calendario Financiero
            </h2>
          </div>
        </div>
      </header>
<CalendarClient 
      initialEvents={events} 
      currentMonth={currentMonth} 
      currentYear={currentYear} 
    />
      </>
  );
}
