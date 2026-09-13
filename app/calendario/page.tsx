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
    <CalendarClient 
      initialEvents={events} 
      currentMonth={currentMonth} 
      currentYear={currentYear} 
    />
  );
}
