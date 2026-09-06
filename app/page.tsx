import Image from "next/image";
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  familyData,
  metrics,
  coupleBreakdown,
  upcomingBills,
  vehicleData,
} from "../lib/mockData";

export default function Home() {
  return (
    <>
      <header
        className="bg-white/80 backdrop-blur border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between"
        data-purpose="top-header"
      >
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
            FC
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 block">
              Finanzas Familiares
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Panel de Control
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{familyData.month}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sincronizado</span>
          </div>
        </div>
      </header>

      <main
        className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6"
        data-purpose="dashboard-content"
      >
        <section
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl shadow-emerald-950/10 p-5 sm:p-7"
          data-purpose="inspirational-hero-banner"
        >
          <div className="absolute -right-16 -top-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-24 w-72 h-72 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <div className="relative shrink-0 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-300/40 shadow-lg shadow-black/20 bg-emerald-950 flex items-center justify-center relative">
                <Image
                  src={familyData.heroImage}
                  alt="Orgullo de la Familia"
                  fill
                  className="object-cover object-top transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-2 -right-1 bg-rose-500 text-white rounded-full p-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-[11px] font-medium text-emerald-200">
                <span>🌟 Nuestro Gran Motivo</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {familyData.heroMessage}
              </h2>
              <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl font-normal">
                {familyData.heroQuote}
              </p>
            </div>

            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 text-center flex-1 sm:flex-initial">
                <p className="text-[11px] text-emerald-200 uppercase font-semibold">
                  Meta Familiar
                </p>
                <p className="text-base font-bold text-white">Fondo Guardería</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          data-purpose="quick-action-buttons"
        >
          <button
            type="button"
            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-bento-hover transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm sm:text-base">
                  Registrar pago
                </p>
                <p className="text-xs text-slate-500">
                  Luz, internet, cuotas, tarjetas, seguros...
                </p>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          <button
            type="button"
            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-bento-hover transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm sm:text-base">
                  Registrar gasto
                </p>
                <p className="text-xs text-slate-500">
                  Supermercado, gasolina, salidas, compras...
                </p>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </section>

        <section
          className="rounded-3xl bg-emerald-700 text-white p-6 sm:p-8 shadow-lg shadow-emerald-800/15 relative overflow-hidden"
          data-purpose="hero-balance-card"
        >
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-200">
                  Saldo Actual Real
                </span>
                <span className="bg-emerald-800/80 border border-emerald-500/30 text-[10px] text-emerald-100 px-2 py-0.5 rounded-md">
                  En Mano / Cuentas
                </span>
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-mono">
                +B/.{metrics.actualBalance.toFixed(2)}
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-lg leading-relaxed pt-1">
                Solo considera dinero recibido efectivamente, deduciendo pagos y
                gastos ya ejecutados. Los presupuestos futuros no se descuentan
                hasta cancelarse.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              <div className="bg-emerald-800/50 backdrop-blur border border-emerald-600/50 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-emerald-200 block">
                    Ingresos recibidos
                  </span>
                  <span className="text-xl font-bold text-white font-mono">
                    +B/.{metrics.incomesReceived.toFixed(2)}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-600/40 flex items-center justify-center text-emerald-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-emerald-800/50 backdrop-blur border border-emerald-600/50 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-emerald-200 block">
                    Disponible libre estimado
                  </span>
                  <span className="text-xl font-bold text-amber-300 font-mono">
                    -B/.{Math.abs(metrics.availableEstimated).toFixed(2)}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-600/40 flex items-center justify-center text-amber-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          data-purpose="monthly-indicators-grid"
        >
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-bento transition">
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Pagos realizados
            </span>
            <span className="text-lg sm:text-2xl font-bold text-rose-600 tracking-tight font-mono">
              -B/.{metrics.paymentsDone.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Obligaciones cubiertas
            </span>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-bento transition">
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Gastos cotidianos
            </span>
            <span className="text-lg sm:text-2xl font-bold text-rose-600 tracking-tight font-mono">
              -B/.{metrics.dailyExpenses.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Supermercado & día a día
            </span>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 bg-amber-50/20 shadow-sm hover:shadow-bento transition">
            <span className="text-xs font-medium text-amber-800 block mb-1">
              Pendiente por pagar
            </span>
            <span className="text-lg sm:text-2xl font-bold text-amber-700 tracking-tight font-mono">
              -B/.{metrics.pendingPayments.toFixed(2)}
            </span>
            <span className="text-[11px] text-amber-600 block mt-1">
              Próximos compromisos
            </span>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-bento transition">
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Metas cumplidas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-bold text-emerald-700 tracking-tight">
                {metrics.goalsCompleted}/{metrics.goalsTotal}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {metrics.goalsPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${metrics.goalsPercentage}%` }}
              ></div>
            </div>
          </div>
        </section>

        <section className="space-y-3" data-purpose="couple-finances-breakdown">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Resumen por Cónyuge
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Equilibrio y Colaboración
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupleBreakdown.map((person) => (
              <article
                key={person.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-bento transition space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-${person.color}-50 text-${person.color}-700 font-bold flex items-center justify-center text-sm border border-${person.color}-100`}
                    >
                      {person.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {person.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Resumen real del mes
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {person.role}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50/80 p-2.5 rounded-xl">
                    <span className="text-[11px] font-medium text-slate-500 uppercase block">
                      Ingresos
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 font-mono">
                      +B/.{person.incomes.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl">
                    <span className="text-[11px] font-medium text-slate-500 uppercase block">
                      Salidas
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-rose-600 font-mono">
                      -B/.{person.expenses.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[11px] font-medium text-emerald-800 uppercase block">
                      Saldo
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 font-mono">
                      +B/.{person.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          data-purpose="upcoming-obligations"
        >
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Próximos Pagos a Vencer
              </h4>
              <button className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                Ver todos (6)
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="py-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${bill.colorClass} flex items-center justify-center font-bold text-xs`}
                    >
                      {bill.icon}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        {bill.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {bill.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 font-mono">
                    -B/.{bill.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>🚗</span>
                  Vehículo Familiar
                </h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {vehicleData.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {vehicleData.info}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Presupuesto Gasolina Mes</span>
                <span className="text-slate-800 font-mono">
                  B/.{vehicleData.budgetTotal.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-2 rounded-full"
                  style={{ width: `${vehicleData.percentage}%` }}
                ></div>
              </div>
              <span className="text-[11px] text-slate-400 block text-right font-mono">
                B/.{vehicleData.budgetUsed.toFixed(2)} consumidos
              </span>
            </div>
            <button
              type="button"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Ver Ficha de Mantenimiento
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
