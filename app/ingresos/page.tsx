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

export default async function IngresosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = fullName.charAt(0).toUpperCase();

  // Fetch real incomes from Supabase
  const { data: incomes = [], error } = await supabase
    .from('incomes')
    .select('*')
    .order('date_expected', { ascending: true });

  if (error) {
    // console.warn('Error fetching incomes:', error.message);
  }

  // Calculate metrics
  const projected = incomes?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const projectedCount = incomes?.length || 0;
  const received = incomes?.filter(i => i.is_received).reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const receivedCount = incomes?.filter(i => i.is_received).length || 0;
  const pending = projected - received;
  const pendingCount = projectedCount - receivedCount;
  const percent = projected > 0 ? (received / projected * 100).toFixed(1) : "0.0";

  const dynamicMetrics = {
    projected,
    projectedCount,
    received,
    receivedCount,
    pending,
    pendingCount,
    percent
  };

  // Calculate Breakdown
  const cfIncomes = incomes?.filter(i => i.person === 'cristhian') || [];
  const cfProjected = cfIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const cfReceived = cfIncomes.filter(i => i.is_received).reduce((acc, curr) => acc + curr.amount, 0);
  
  const jcIncomes = incomes?.filter(i => i.person === 'jennifer') || [];
  const jcProjected = jcIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const jcReceived = jcIncomes.filter(i => i.is_received).reduce((acc, curr) => acc + curr.amount, 0);

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
      pending: cfProjected - cfReceived,
      footer: "Ingresos programados",
      footerDates: "Mes actual",
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
      pending: jcProjected - jcReceived,
      footer: "Ingresos programados",
      footerDates: "Mes actual",
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
            <span>{familyData.month}</span>
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
            <p className="text-sm text-slate-500 max-w-2xl mt-1">
              Planificación y confirmación de depósitos para <span className="font-semibold text-slate-700">Cristhian Fuentes</span> y <span className="font-semibold text-slate-700">Jennifer Camaño</span>. Al confirmar, el saldo se acredita al instante en el flujo real del hogar.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white shadow-sm rounded-full p-1 border border-slate-200">
              <button aria-label="Mes anterior" className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-3 flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                <CalendarDays className="text-emerald-700 w-4 h-4" />
                <span className="font-semibold">{familyData.month}</span>
              </div>
              <button aria-label="Mes siguiente" className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <AddIncomeModal />
          </div>
        </header>

        {/* Info Banner */}
        <div className="flex items-start sm:items-center gap-3 bg-teal-50/80 border border-teal-100 text-teal-800 px-4 py-3 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-slate-600">
            Tu salario y gastos de representación usan calendarios quincenales ajustados. Al marcar <strong className="text-emerald-700 font-semibold">“Confirmar recibido”</strong> el monto pasa al fondo disponible garantizado.
          </p>
        </div>

        {/* Master Monthly Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs uppercase tracking-wider font-semibold">Ingresos Proyectados</span>
              <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-700">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">B/. {dynamicMetrics.projected.toFixed(2)}</div>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> {dynamicMetrics.projectedCount} conceptos planificados
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between text-slate-500">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">Efectivo en Cuenta</span>
              <span className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="relative z-10 mt-4">
              <div className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">B/. {dynamicMetrics.received.toFixed(2)}</div>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {dynamicMetrics.receivedCount} depósitos confirmados
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs uppercase tracking-wider font-semibold">Pendiente por Cobrar</span>
              <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                <Hourglass className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">B/. {dynamicMetrics.pending.toFixed(2)}</div>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> {dynamicMetrics.pendingCount} por acreditarse
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs uppercase tracking-wider font-semibold">Efectividad del Mes</span>
              <span className="text-sm font-bold text-emerald-700">{dynamicMetrics.percent}%</span>
            </div>
            <div className="mt-3">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-700" style={{ width: `${dynamicMetrics.percent}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-slate-500 text-xs mt-2">
                <span>Recibido: B/. {dynamicMetrics.received.toFixed(2)}</span>
                <span className="text-emerald-700 font-medium">Meta: 100%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Resumen por Cónyuge */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {dynamicBreakdown.map((person) => (
            <div key={person.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                      {person.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight">{person.name}</h3>
                      <span className="text-xs text-slate-500">{person.subtitle}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs text-slate-700 font-semibold">{person.abonos} Abonos</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100/50 text-center">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">Proyectado</div>
                    <div className="text-sm font-semibold font-mono text-slate-900 mt-0.5">B/. {person.projected.toFixed(2)}</div>
                  </div>
                  <div className="bg-white rounded-lg py-1 shadow-sm border border-emerald-100">
                    <div className="text-[11px] font-medium text-emerald-700">Efectivo</div>
                    <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">B/. {person.received.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">Pendiente</div>
                    <div className="text-sm font-medium font-mono text-slate-500 mt-0.5">B/. {person.pending.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${person.dotColor}`}></span> {person.footer}
                </span>
                <span className="font-medium text-emerald-700">{person.footerDates}</span>
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
