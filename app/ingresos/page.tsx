import { 
  Wallet, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  PlusCircle, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Hourglass, 
  Calendar,
  Clock
} from 'lucide-react';
import { createClient } from "@/lib/supabase/server";
import { MobileMenuDrawer } from "../components/MobileMenuDrawer";
import { familyData, ingresosMetrics, ingresosBreakdown } from "@/lib/mockData";
import { IncomeList } from "./components/IncomeList";
import { AddIncomeModal } from "./components/AddIncomeModal";
import { generateMonthlyIncomes } from "@/app/actions/income";
import { MonthFilter } from "./components/MonthFilter";

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default async function IngresosPage(props: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  // Determine selected year and month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const selectedYear = searchParams.year ? parseInt(searchParams.year) : currentYear;
  const selectedMonth = searchParams.month ? parseInt(searchParams.month) : currentMonth;
  
  const displayMonthString = `${MONTHS[selectedMonth]} ${selectedYear}`;

  // 1. Auto-generate missing fixed incomes for the selected month
  await generateMonthlyIncomes(selectedYear, selectedMonth);

  // 2. Fetch all incomes for calculations
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  // Calculate first and last day of the selected month
  const firstDay = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

  // Fetch real incomes from Supabase filtered by the selected month
  const { data: incomes = [], error } = await supabase
    .from('incomes')
    .select('*')
    .gte('date_expected', firstDay)
    .lte('date_expected', lastDay)
    .order('date_expected', { ascending: true });

  if (error) {
    // console.warn('Error fetching incomes:', error.message);
  }

  // Split incomes into planned and extraordinary
  const plannedIncomes = incomes?.filter(i => ['salario', 'representacion', 'carro'].includes(i.category)) || [];
  const extraordinaryIncomes = incomes?.filter(i => !['salario', 'representacion', 'carro'].includes(i.category)) || [];

  // Global Metrics
  const hasPlannedData = plannedIncomes.length > 0;

  const projected = hasPlannedData ? plannedIncomes.reduce((acc, curr) => acc + curr.amount, 0) : 2172.40;
  const projectedCount = hasPlannedData ? plannedIncomes.length : 7;
  
  const received = incomes?.filter(i => i.is_received).reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const receivedCount = incomes?.filter(i => i.is_received).length || 0;
  
  const plannedReceived = plannedIncomes.filter(i => i.is_received).reduce((acc, curr) => acc + curr.amount, 0);
  const pending = hasPlannedData ? projected - plannedReceived : 0;
  const pendingCount = hasPlannedData ? projectedCount - plannedIncomes.filter(i => i.is_received).length : 0;
  
  // Efectividad takes into account all received income, so it can surpass 100%
  const percent = projected > 0 ? ((received / projected) * 100).toFixed(1) : "0.0";

  const extraordinaryTotal = extraordinaryIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const extraordinaryReceived = extraordinaryIncomes.filter(i => i.is_received).reduce((acc, curr) => acc + curr.amount, 0);
  const extraordinaryCount = extraordinaryIncomes.length;

  const dynamicMetrics = {
    projected,
    projectedCount,
    received,
    receivedCount,
    pending,
    pendingCount,
    percent,
    extraordinaryTotal,
    extraordinaryReceived,
    extraordinaryCount
  };

  // Calculate Breakdown
  const cfIncomes = incomes?.filter(i => i.person === 'cristhian') || [];
  const cfPlanned = cfIncomes.filter(i => ['salario', 'representacion', 'carro'].includes(i.category));
  const hasCfData = cfPlanned.length > 0;
  const cfProjected = hasCfData ? cfPlanned.reduce((acc, curr) => acc + curr.amount, 0) : 1189.68;
  const cfReceived = cfIncomes.filter(i => i.is_received).reduce((acc, curr) => acc + curr.amount, 0);
  const cfPending = hasCfData ? cfProjected - cfReceived : 0;
  
  const jcIncomes = incomes?.filter(i => i.person === 'jennifer') || [];
  const jcPlanned = jcIncomes.filter(i => ['salario', 'representacion', 'carro'].includes(i.category));
  const hasJcData = jcPlanned.length > 0;
  const jcProjected = hasJcData ? jcPlanned.reduce((acc, curr) => acc + curr.amount, 0) : 982.72;
  const jcReceived = jcIncomes.filter(i => i.is_received).reduce((acc, curr) => acc + curr.amount, 0);
  const jcPending = hasJcData ? jcProjected - jcReceived : 0;

  const dynamicBreakdown = [
    {
      id: "cf",
      name: "Cristhian Fuentes",
      initials: "CF",
      subtitle: "Salarios & Gastos de Representación",
      color: "emerald",
      abonos: cfIncomes.length,
      projected: cfProjected,
      received: cfReceived,
      pending: cfPending,
      footer: "Ingresos programados",
      footerDates: displayMonthString,
      dotColor: "bg-emerald-500"
    },
    {
      id: "jc",
      name: "Jennifer Camaño",
      initials: "JC",
      subtitle: "Salario base, Carro & Comisión Meta",
      color: "teal",
      abonos: jcIncomes.length,
      projected: jcProjected,
      received: jcReceived,
      pending: jcPending,
      footer: "Ingresos programados",
      footerDates: displayMonthString,
      dotColor: "bg-indigo-500"
    }
  ];

  return (
    <>
      <header
        className="bg-white/80 backdrop-blur border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <MobileMenuDrawer avatarUrl={avatarUrl} fullName={fullName} initial={initial} />
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 block">
              Finanzas Familiares
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Ingresos
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="capitalize">{displayMonthString}</span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sincronizado</span>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Top Action Bar */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-800">
                <Wallet className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Calendario Real de Cobro</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">Ingresos Familiares</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <MonthFilter currentYear={selectedYear} currentMonth={selectedMonth} />
            <AddIncomeModal />
          </div>
        </header>

        {/* Master Monthly Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
          <div className="bg-white rounded-2xl p-4 xl:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between text-slate-500 gap-2">
              <span className="text-[10px] xl:text-xs uppercase tracking-wider font-semibold leading-tight mt-0.5">Ingresos Proyectados</span>
              <span className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-700 shrink-0">
                <TrendingUp className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-lg xl:text-xl font-bold font-mono text-slate-900 tracking-tight whitespace-nowrap">B/. {formatCurrency(dynamicMetrics.projected)}</div>
              <span className="text-[10px] xl:text-xs text-slate-500 flex items-center gap-1 mt-1 leading-tight">
                <Clock className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-emerald-600 shrink-0" /> {dynamicMetrics.projectedCount} planificados
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 xl:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex items-start justify-between text-slate-500 gap-2">
              <span className="text-[10px] xl:text-xs uppercase tracking-wider font-bold text-emerald-700 leading-tight mt-0.5">Efectivo en Cuenta</span>
              <span className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </span>
            </div>
            <div className="relative z-10 mt-4">
              <div className="text-lg xl:text-xl font-bold font-mono text-emerald-700 tracking-tight whitespace-nowrap">B/. {formatCurrency(dynamicMetrics.received)}</div>
              <span className="text-[10px] xl:text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1 leading-tight">
                <CheckCircle2 className="w-3 h-3 xl:w-3.5 xl:h-3.5 shrink-0" /> {dynamicMetrics.receivedCount} confirmados
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 xl:p-5 border border-amber-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between text-slate-500 gap-2">
              <span className="text-[10px] xl:text-xs uppercase tracking-wider font-semibold text-amber-700 leading-tight mt-0.5">Extraordinarios</span>
              <span className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <PlusCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-lg xl:text-xl font-bold font-mono text-slate-900 tracking-tight whitespace-nowrap">B/. {formatCurrency(dynamicMetrics.extraordinaryTotal)}</div>
              <span className="text-[10px] xl:text-xs text-slate-500 flex items-center gap-1 mt-1 leading-tight">
                <CheckCircle2 className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-amber-500 shrink-0" /> B/. {formatCurrency(dynamicMetrics.extraordinaryReceived)} recibidos
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 xl:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between text-slate-500 gap-2">
              <span className="text-[10px] xl:text-xs uppercase tracking-wider font-semibold leading-tight mt-0.5">Pendiente por Cobrar</span>
              <span className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Hourglass className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-lg xl:text-xl font-bold font-mono text-slate-900 tracking-tight whitespace-nowrap">B/. {formatCurrency(dynamicMetrics.pending)}</div>
              <span className="text-[10px] xl:text-xs text-slate-500 flex items-center gap-1 mt-1 leading-tight">
                <CalendarDays className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-slate-400 shrink-0" /> {dynamicMetrics.pendingCount} por acreditarse
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 xl:p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between text-slate-500 gap-2">
              <span className="text-[10px] xl:text-xs uppercase tracking-wider font-semibold leading-tight mt-0.5">Efectividad del Mes</span>
              <span className="text-xs xl:text-sm font-bold text-emerald-700 shrink-0">{dynamicMetrics.percent}%</span>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-100 h-1.5 xl:h-2 rounded-full overflow-hidden flex">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, parseFloat(dynamicMetrics.percent))}%` }}></div>
              </div>
              <div className="flex flex-wrap justify-between items-center text-slate-500 text-[10px] xl:text-xs mt-2 gap-1">
                <span className="truncate">Recibido: B/. {formatCurrency(dynamicMetrics.received)}</span>
                <span className="text-emerald-700 font-medium whitespace-nowrap">Meta: 100%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Resumen por Cónyuge */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {dynamicBreakdown.map((person) => (
            <div key={person.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                      {person.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight truncate">{person.name}</h3>
                      <span className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 sm:truncate">{person.subtitle}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1.5 rounded-full bg-slate-100 text-[10px] sm:text-xs text-slate-700 font-semibold whitespace-nowrap shrink-0">{person.abonos} Abonos</span>
                </div>

                <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-5 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-100/50 text-center">
                  <div className="px-0.5 sm:px-1">
                    <div className="text-[9px] sm:text-[11px] font-medium text-slate-500">Proyectado</div>
                    <div className="text-[11px] sm:text-sm font-semibold font-mono text-slate-900 mt-0.5 whitespace-nowrap tracking-tighter sm:tracking-normal">B/. {formatCurrency(person.projected)}</div>
                  </div>
                  <div className="bg-white rounded-lg py-1 shadow-sm border border-emerald-100 px-0.5 sm:px-1">
                    <div className="text-[9px] sm:text-[11px] font-medium text-emerald-700">Efectivo</div>
                    <div className="text-[11px] sm:text-sm font-bold font-mono text-emerald-700 mt-0.5 whitespace-nowrap tracking-tighter sm:tracking-normal">B/. {formatCurrency(person.received)}</div>
                  </div>
                  <div className="px-0.5 sm:px-1">
                    <div className="text-[9px] sm:text-[11px] font-medium text-slate-500">Pendiente</div>
                    <div className="text-[11px] sm:text-sm font-medium font-mono text-slate-500 mt-0.5 whitespace-nowrap tracking-tighter sm:tracking-normal">B/. {formatCurrency(person.pending)}</div>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${person.dotColor}`}></span> {person.footer}
                </span>
                <span className="font-medium text-emerald-700 capitalize">{person.footerDates}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Lista Interactiva de Ingresos */}
        <IncomeList incomes={incomes || []} />
        
      </main>
    </>
  );
}
