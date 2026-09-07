'use client';

import { useState } from 'react';
import { 
  Calendar, CheckCircle2, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, 
  Wallet, Car, Wrench, Home, Target, Banknote, FileText 
} from 'lucide-react';
import Link from 'next/link';

// Modals
import { AddIncomeModal } from '@/app/ingresos/components/AddIncomeModal';
import { AddDailyExpenseModal } from '@/app/gastos-diarios/components/AddDailyExpenseModal';
import AddKmModal from '@/app/vehiculos/components/AddKmModal';
import AddMaintenanceModal from '@/app/vehiculos/components/AddMaintenanceModal';
import AddPendingModal from '@/app/vehiculos/components/AddPendingModal';
import AddHomeTaskModal from '@/app/hogar/components/AddHomeTaskModal';
import AddGoalModal from '@/app/metas/components/AddGoalModal';
import { PayFixedPaymentModal } from './PayFixedPaymentModal';

import { 
  DashboardMetrics, 
  CoupleBreakdown, 
  UpcomingPayment, 
  DashboardVehicleData 
} from '@/app/actions/dashboard';

interface DashboardClientProps {
  metrics: DashboardMetrics;
  coupleBreakdown: CoupleBreakdown[];
  upcomingBills: UpcomingPayment[];
  vehicleData: DashboardVehicleData;
  vehicles: any[];
  fixedPayments: any[];
}

export function DashboardClient({
  metrics,
  coupleBreakdown,
  upcomingBills,
  vehicleData,
  vehicles,
  fixedPayments
}: DashboardClientProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const closeModals = () => setActiveModal(null);

  const totalPagado = metrics.paymentsDone + metrics.dailyExpenses;
  const pendientePorPagar = metrics.pendingPayments;
  const totalObligaciones = totalPagado + pendientePorPagar;
  const cumplimiento = totalObligaciones > 0 ? Math.round((totalPagado / totalObligaciones) * 100) : 0;
  
  const totalFixed = metrics.paymentsDone + metrics.pendingPayments;

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Acciones Rápidas
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button onClick={() => setActiveModal('ingreso')} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <Banknote className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">Ingreso<br/>Eventual</span>
          </button>
          
          <button onClick={() => setActiveModal('gasto')} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-100 transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">Registrar<br/>Gasto</span>
          </button>

          <button onClick={() => setActiveModal('km')} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">Kilometraje</span>
          </button>

          <button onClick={() => setActiveModal('mantenimiento')} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">Mantenimiento<br/>Vehículo</span>
          </button>
          
          <button onClick={() => setActiveModal('pendiente')} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">Trabajo<br/>Pendiente (Auto)</span>
          </button>

          <button onClick={() => setActiveModal('hogar')} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">Trabajo<br/>Hogar</span>
          </button>

          <button onClick={() => setActiveModal('meta')} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">Nueva<br/>Meta de Ahorro</span>
          </button>

          <button onClick={() => setActiveModal('pago-fijo')} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-violet-300 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-100 transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">Pago<br/>Gasto Fijo</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Main Balance Card */}
          <section
            className="relative bg-[#09574a] rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl shadow-emerald-900/10 border border-emerald-800/50"
            data-purpose="main-balance"
          >
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-24 bg-teal-500/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-50 text-xs font-semibold backdrop-blur-sm border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Total Pagado (Mes Actual)
                </span>
                <Link href="/consultas" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/5">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-6">
                <div>
                  <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-sm">
                    {formatCurrency(totalPagado)}
                  </h1>
                </div>
                <div className="flex items-center gap-2 pb-1 sm:pb-2">
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-100 bg-emerald-800/40 px-2 py-0.5 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-300" />
                    +{formatCurrency(metrics.incomesReceived)} Ingresos
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-emerald-100/80 text-xs font-medium uppercase tracking-wider mb-1">
                    Pendiente por Pagar
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {formatCurrency(pendientePorPagar)}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-emerald-100/80 text-xs font-medium uppercase tracking-wider mb-1">
                    Cumplimiento
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {cumplimiento}%
                    </p>
                    <span className="text-xs text-emerald-200 mb-1">al día</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Overview */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/gastos-diarios" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <span className="text-slate-400 group-hover:text-rose-500 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gastos Diarios</p>
              <p className="text-lg font-extrabold text-slate-900 mt-auto">{formatCurrency(metrics.dailyExpenses)}</p>
            </Link>

            <Link href="/pagos-fijos" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative overflow-hidden">
              <div className={`absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-out`} style={{ width: `${totalFixed > 0 ? (metrics.paymentsDone / totalFixed) * 100 : 0}%` }}></div>
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pagos Fijos Cumplimiento</p>
              <div className="flex items-baseline gap-1 mt-auto">
                <p className="text-lg font-extrabold text-slate-900">{Math.round(totalFixed > 0 ? (metrics.paymentsDone / totalFixed) * 100 : 0)}%</p>
                <span className="text-xs text-slate-400 font-medium ml-1">pagado</span>
              </div>
            </Link>

            <Link href="/gastos-diarios" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-slate-400 group-hover:text-violet-500 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Uso Tarjeta Crédito</p>
              <p className="text-lg font-extrabold text-slate-900 mt-auto">{formatCurrency(metrics.creditCardTotal)}</p>
            </Link>
          </section>

          {/* Couple Breakdown */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              Desglose por Cónyuge
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupleBreakdown.map((person) => (
                <div key={person.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm
                      ${person.color === 'brand' ? 'bg-[#09574a]' : 'bg-teal-600'}
                    `}>
                      {person.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{person.name}</p>
                      <p className="text-xs text-slate-500">{person.role}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Aportes (Ingreso)</span>
                      <span className="font-bold text-slate-900">{formatCurrency(person.incomes)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Asignaciones</span>
                      <span className="font-bold text-rose-600">-{formatCurrency(person.expenses)}</span>
                    </div>
                    <div className="h-px bg-slate-200 w-full my-1"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 uppercase">Saldo Neto</span>
                      <span className={`text-sm font-extrabold ${person.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(person.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / Upcoming */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Próximos Pagos
              </h3>
              <Link href="/pagos-fijos" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingBills.length > 0 ? upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 mr-3 ${bill.colorClass}`}>
                    {bill.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{bill.title}</p>
                    <p className={`text-xs font-medium truncate ${bill.daysRemaining <= 3 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                      {bill.subtitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-extrabold text-slate-900">{formatCurrency(bill.amount)}</p>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">¡Todo al día!</p>
                  <p className="text-xs text-slate-500">No hay pagos próximos vencidos.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Embedded Modals */}
      <AddIncomeModal isOpen={activeModal === 'ingreso'} onClose={closeModals} />
      <AddDailyExpenseModal isOpen={activeModal === 'gasto'} onClose={closeModals} />
      <AddKmModal isOpen={activeModal === 'km'} onClose={closeModals} vehicles={vehicles} />
      <AddMaintenanceModal isOpen={activeModal === 'mantenimiento'} onClose={closeModals} vehicles={vehicles} />
      <AddPendingModal isOpen={activeModal === 'pendiente'} onClose={closeModals} vehicles={vehicles} />
      <AddHomeTaskModal isOpen={activeModal === 'hogar'} onClose={closeModals} />
      <AddGoalModal isOpen={activeModal === 'meta'} onClose={closeModals} />
      <PayFixedPaymentModal isOpen={activeModal === 'pago-fijo'} onClose={closeModals} fixedPayments={fixedPayments} />
    </div>
  );
}
