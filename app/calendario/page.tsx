import { getCalendarEvents } from '../actions/calendario';
import { CalendarClient } from './components/CalendarClient';

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const d = new Date();
  const currentMonth = searchParams.month ? parseInt(searchParams.month, 10) : d.getMonth() + 1;
  const currentYear = searchParams.year ? parseInt(searchParams.year, 10) : d.getFullYear();

  const events = await getCalendarEvents(currentYear, currentMonth);

  return (
    <CalendarClient 
      initialEvents={events} 
      currentMonth={currentMonth} 
      currentYear={currentYear} 
    />
  );
}
