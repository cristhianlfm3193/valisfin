'use client';

import { useState, useRef } from 'react';
import { 
  Calendar, CheckCircle2, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, 
  Wallet, Car, Wrench, Home, Target, Banknote, FileText, Utensils, Send, Loader2, Paperclip, X
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
import { analyzeUniversalText } from '@/app/actions/ai_expense';

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
  const [aiText, setAiText] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiExpenseData, setAiExpenseData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAiFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setAiFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiText.trim() && !aiFile) return;
    
    setIsAnalyzing(true);
    try {
      let base64Data: string | undefined;
      let mimeType: string | undefined;

      if (aiFile) {
        base64Data = await getBase64(aiFile);
        mimeType = aiFile.type;
      }

      const result = await analyzeUniversalText(aiText, base64Data, mimeType);
      if (result.success && result.data) {
        setAiExpenseData(result.data.parametros);
        
        switch (result.data.accion) {
          case 'gasto':
            setActiveModal('gasto');
            break;
          case 'ingreso':
            setActiveModal('ingreso');
            break;
          case 'kilometraje':
            setActiveModal('km');
            break;
          case 'mantenimiento_auto':
            setActiveModal('mantenimiento');
            break;
          case 'pendiente_auto':
            setActiveModal('pendiente');
            break;
          case 'trabajo_hogar':
            setActiveModal('hogar');
            break;
          case 'meta_ahorro':
            setActiveModal('meta');
            break;
          case 'pago_fijo':
            setActiveModal('pago-fijo');
            break;
          case 'desconocido':
            alert('No pude entender la instrucción. Intenta ser más específico, por ejemplo: "Gasté 15 en el súper" o "Pagué la luz".');
            break;
          default:
            setActiveModal('gasto'); // fallback
        }
        setAiText(''); // Clear input
        removeFile(); // Clear file
      } else {
        alert(result.error || 'No se pudo analizar el texto.');
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error al procesar la solicitud.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const closeModals = () => {
    setActiveModal(null);
    setAiExpenseData(null);
  };

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

        {/* AI Quick Entry */}
        <div className="mb-4">
          <form onSubmit={handleAiSubmit} className="relative flex flex-col items-center w-full">
            <div className="relative flex items-center w-full">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,application/pdf" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="absolute left-2 p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 disabled:opacity-50 transition-colors z-10"
                title="Adjuntar factura o recibo (Imagen/PDF)"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input 
                type="text"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Ej: Gasté 15 en Súper 99..."
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                disabled={isAnalyzing}
              />
              <button 
                type="submit" 
                disabled={isAnalyzing || (!aiText.trim() && !aiFile)}
                className="absolute right-2 p-2 rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-300 transition-colors z-10"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            
            {/* File Thumbnail Indicator */}
            {aiFile && (
              <div className="w-full mt-2 flex items-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-medium">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">{aiFile.name}</span>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    className="p-0.5 rounded-md hover:bg-emerald-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </form>
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

            <Link href="/gastos-diarios" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-slate-400 group-hover:text-orange-500 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Restaurante</p>
              <div className="flex items-baseline gap-1 mt-auto">
                <p className="text-lg font-extrabold text-slate-900">{formatCurrency(metrics.restauranteSpent)}</p>
                <span className="text-xs text-slate-400 font-medium ml-1">gastado</span>
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
              {coupleBreakdown.map((person) => {
                const isCf = person.id === 'cristhian';
                const hoverClass = isCf ? "hover:border-emerald-300" : "hover:border-pink-300";
                const initialsColor = isCf ? "bg-emerald-50 border-emerald-100 text-[#006655]" : "bg-pink-50 border-pink-100 text-pink-600";
                const effectiveBoxBorder = isCf ? "border-emerald-100" : "border-pink-100";
                const effectiveBoxText = isCf ? "text-emerald-700" : "text-pink-700";
                const subtitle = isCf ? "Salarios & Gastos de Representación" : "Salario base, Carro & Comisión Meta";

                return (
                  <div key={person.id} className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between transition-all ${hoverClass}`}>
                    <div>
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold shrink-0 ${initialsColor}`}>
                            {person.initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight truncate">{person.name}</h3>
                            <span className="text-[10px] sm:text-xs text-slate-500 line-clamp-2 sm:truncate">{subtitle}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1.5 rounded-full bg-slate-100 text-[10px] sm:text-xs text-slate-700 font-semibold whitespace-nowrap shrink-0">{person.abonos || 0} Abonos</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-5 p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-100/50 text-center">
                        <div className="px-0.5 sm:px-1">
                          <div className="text-[9px] sm:text-[11px] font-medium text-slate-500 truncate">Proyectado</div>
                          <div className="text-[10px] sm:text-sm font-semibold font-mono text-slate-900 mt-0.5 tracking-tight">{formatCurrency(person.projected || 0)}</div>
                        </div>
                        <div className={`bg-white rounded-lg py-1 shadow-sm border px-0.5 sm:px-1 ${effectiveBoxBorder}`}>
                          <div className={`text-[9px] sm:text-[11px] font-medium truncate ${effectiveBoxText}`}>Efectivo</div>
                          <div className={`text-[10px] sm:text-sm font-bold font-mono mt-0.5 tracking-tight ${effectiveBoxText}`}>{formatCurrency(person.incomes || 0)}</div>
                        </div>
                        <div className="px-0.5 sm:px-1">
                          <div className="text-[9px] sm:text-[11px] font-medium text-slate-500 truncate">Pendiente</div>
                          <div className="text-[10px] sm:text-sm font-medium font-mono text-slate-500 mt-0.5 tracking-tight">{formatCurrency(person.pending || 0)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-medium">Asignaciones / Gastos</span>
                        <span className="font-bold text-rose-600">-{formatCurrency(person.expenses || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 uppercase">Saldo Neto (Bolsillo)</span>
                        <span className={`text-sm font-extrabold ${(person.balance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(person.balance || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
      <AddIncomeModal isOpen={activeModal === 'ingreso'} onClose={closeModals} initialData={aiExpenseData} />
      <AddDailyExpenseModal isOpen={activeModal === 'gasto'} onClose={closeModals} initialData={aiExpenseData} />
      <AddKmModal isOpen={activeModal === 'km'} onClose={closeModals} vehicles={vehicles} initialData={aiExpenseData} />
      <AddMaintenanceModal isOpen={activeModal === 'mantenimiento'} onClose={closeModals} vehicles={vehicles} initialData={aiExpenseData} />
      <AddPendingModal isOpen={activeModal === 'pendiente'} onClose={closeModals} vehicles={vehicles} initialData={aiExpenseData} />
      <AddHomeTaskModal isOpen={activeModal === 'hogar'} onClose={closeModals} initialData={aiExpenseData} />
      <AddGoalModal isOpen={activeModal === 'meta'} onClose={closeModals} initialData={aiExpenseData} />
      <PayFixedPaymentModal isOpen={activeModal === 'pago-fijo'} onClose={closeModals} fixedPayments={fixedPayments} initialData={aiExpenseData} />
    </div>
  );
}
