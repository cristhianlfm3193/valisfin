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

// ─── Pill-tab Quick Action Group ─────────────────────────────────────────────
type QAColor = 'emerald' | 'blue' | 'teal';

interface QAOption { id: string; label: string; icon: React.ReactNode; }

function QuickActionGroup({ label, color, options, onSelect }: {
  label: string;
  color: QAColor;
  options: QAOption[];
  onSelect: (id: string) => void;
}) {
  const [selected, setSelected] = useState(options[0].id);

  const ring: Record<QAColor, string> = {
    emerald: 'ring-emerald-500',
    blue:    'ring-blue-500',
    teal:    'ring-teal-500',
  };
  const activePill: Record<QAColor, string> = {
    emerald: 'bg-emerald-700 text-white shadow-emerald-900/30',
    blue:    'bg-blue-700 text-white shadow-blue-900/30',
    teal:    'bg-teal-700 text-white shadow-teal-900/30',
  };
  const actionBtn: Record<QAColor, string> = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
    blue:    'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
    teal:    'bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500',
  };

  return (
    <div className="flex items-center gap-3 bg-[#121c27]/85 backdrop-blur-md rounded-2xl border border-emerald-500/20 shadow-sm px-4 py-3">
      {/* Label */}
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 w-24 hidden sm:block">
        {label}
      </span>
      {/* Pills */}
      <div
        role="tablist"
        className="flex items-center gap-1 flex-1 flex-wrap p-1 bg-black/30 rounded-full border border-white/5"
      >
        {options.map(opt => (
          <label
            key={opt.id}
            className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 select-none ${
              selected === opt.id
                ? `${activePill[color]} shadow`
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <input
              type="radio"
              name={`qa-${label}`}
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => setSelected(opt.id)}
              className="sr-only"
            />
            {opt.icon}
            {opt.label}
          </label>
        ))}
      </div>
      {/* Action button */}
      <button
        onClick={() => onSelect(selected)}
        className={`shrink-0 h-8 px-4 rounded-full text-xs font-bold text-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${actionBtn[color]}`}
      >
        Abrir →
      </button>
    </div>
  );
}

interface DashboardClientProps {
  metrics: DashboardMetrics;
  coupleBreakdown: CoupleBreakdown[];
  upcomingBills: UpcomingPayment[];
  vehicleData: DashboardVehicleData;
  vehicles: any[];
  fixedPayments: any[];
  currentUserEmail?: string;
  currentUserName?: string;
}

export function DashboardClient({
  metrics,
  coupleBreakdown,
  upcomingBills,
  vehicleData,
  vehicles,
  fixedPayments,
  currentUserEmail = '',
  currentUserName = '',
}: DashboardClientProps) {
  // Determina el pagador según el usuario activo
  const getDefaultPagador = (): 'Cristhian' | 'Jennifer' => {
    const email = currentUserEmail.toLowerCase();
    const name = currentUserName.toLowerCase();
    if (email === 'jenniferyohana.yco@gmail.com' || name.includes('jennifer')) return 'Jennifer';
    return 'Cristhian'; // cristhianf3193@gmail.com o cualquier otro usuario
  };
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [aiText, setAiText] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertStatus, setConvertStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiExpenseData, setAiExpenseData] = useState<any>(null);
  const [chatContext, setChatContext] = useState<'gasto' | 'ingreso' | 'vehiculo' | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name.toLowerCase();
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || fileName.endsWith('.heic') || fileName.endsWith('.heif');

      if (isHeic) {
        setIsConverting(true);
        try {
          let jpegFile: File | null = null;

          // Intento 1: decodificación nativa del browser (instantáneo en iOS Safari)
          setConvertStatus('🔄 Convirtiendo HEIC a JPG...');
          try {
            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            const max = 900;
            let w = bitmap.width, h = bitmap.height;
            if (w > max || h > max) {
              if (w >= h) { h = Math.round(h * max / w); w = max; }
              else { w = Math.round(w * max / h); h = max; }
            }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
            bitmap.close();
            const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.65));
            if (blob) jpegFile = new File([blob], fileName.replace(/\.heic?$/i, '.jpg'), { type: 'image/jpeg' });
          } catch { /* browser no soporta HEIC nativo, seguir al fallback */ }

          // Intento 2: heic2any (WebAssembly) como fallback para Chrome/Firefox
          if (!jpegFile) {
            setConvertStatus('🔄 Convirtiendo con WebAssembly (puede tardar)...');
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.65 });
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            const rawFile = new File([blob], fileName.replace(/\.heic?$/i, '.jpg'), { type: 'image/jpeg' });
            setConvertStatus('✂️ Comprimiendo imagen...');
            jpegFile = await resizeImage(rawFile);
          }

          setAiFile(jpegFile!);
        } catch (error) {
          console.error('Error converting HEIC:', error);
          alert('No se pudo convertir la imagen automáticamente.\nPor favor conviértela manualmente a JPG o PNG.');
          if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
          setIsConverting(false);
          setConvertStatus('');
        }
        return;
      }

      // Para imágenes normales grandes (>2MB), también redimensiona
      if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
        setIsConverting(true);
        try {
          const resized = await resizeImage(file);
          setAiFile(resized);
        } catch {
          setAiFile(file); // si falla, usa el original
        } finally {
          setIsConverting(false);
        }
        return;
      }

      setAiFile(file);
    }
  };

  const removeFile = () => {
    setAiFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Redimensiona y comprime cualquier imagen usando Canvas para
  // mantener el payload pequeño y la API de Gemini responda rápido.
  const resizeImage = (file: File, maxDimension = 850, quality = 0.65): Promise<File> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            else reject(new Error('No se pudo redimensionar la imagen'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo cargar la imagen')); };
      img.src = url;
    });

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
        let fileToSend = aiFile;
        if (aiFile.type.startsWith('image/')) {
          try { fileToSend = await resizeImage(aiFile, 900, 0.75); } catch { /* usar original */ }
        }
        base64Data = await getBase64(fileToSend);
        mimeType = fileToSend.type;
      }

      // ── LOCAL PARSER FALLBACK (AVOID AI OVERLOAD) ──
      // Si no hay archivo y el usuario ya seleccionó un contexto, intentamos extraer los datos localmente primero.
      let localResult = null;
      if (!aiFile && chatContext && aiText) {
        const textLow = aiText.toLowerCase();
        const numMatches = textLow.match(/\b(\d+(?:\.\d{1,2})?)\b/g);
        let monto = numMatches ? parseFloat(numMatches[numMatches.length - 1]) : null;
        const explicitMoney = textLow.match(/(?:cost[oó]|por|\$)\s*(\d+(?:\.\d{1,2})?)/i) || textLow.match(/(\d+(?:\.\d{1,2})?)\s*(?:d[oó]lar|dolares|usd|pavos)/i);
        if (explicitMoney) monto = parseFloat(explicitMoney[1]);

        let fecha = new Date().toISOString().split('T')[0];
        if (/ayer/i.test(textLow)) {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          fecha = d.toISOString().split('T')[0];
        }

        if (chatContext === 'gasto' && monto) {
          localResult = { success: true, data: { accion: 'gasto', parametros: { monto, detalle: aiText, fecha } } };
        } else if (chatContext === 'ingreso' && monto) {
          localResult = { success: true, data: { accion: 'ingreso', parametros: { monto, detalle: aiText, fecha } } };
        } else if (chatContext === 'vehiculo') {
          const kmMatch = textLow.match(/\b(\d{4,6})\b/);
          const vehiculo = /yaris/i.test(textLow) ? 'Yaris' : /tucson/i.test(textLow) ? 'Tucson' : '';
          if (kmMatch && /km|kil[oó]metro|kilometraje/i.test(textLow)) {
            localResult = { success: true, data: { accion: 'kilometraje', parametros: { vehiculo, km_lectura: parseFloat(kmMatch[1]), fecha } } };
          } else if (monto) {
            localResult = { success: true, data: { accion: 'mantenimiento_auto', parametros: { vehiculo, costo_estimado: monto, mantenimiento_tipo: aiText, fecha } } };
          }
        }
      }

      const result = localResult || await analyzeUniversalText(aiText, base64Data, mimeType, chatContext);
      
      if (result.success && result.data) {
        // Siempre usamos el pagador del usuario activo, sin depender de la IA
        const parametros = {
          ...result.data.parametros,
          pagador: getDefaultPagador(),
        };
        setAiExpenseData(parametros);
        
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
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Hubo un error al procesar la solicitud. Intenta de nuevo.');
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
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Acciones Rápidas
          </h2>
        </div>

        <div className="mb-4 space-y-2">
          {/* Chatbot Context Menu */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setChatContext(chatContext === 'gasto' ? null : 'gasto')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${chatContext === 'gasto' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-[#121c27] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              🛒 Gasto Diario
            </button>
            <button
              type="button"
              onClick={() => setChatContext(chatContext === 'ingreso' ? null : 'ingreso')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${chatContext === 'ingreso' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-[#121c27] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              💰 Ingreso
            </button>
            <button
              type="button"
              onClick={() => setChatContext(chatContext === 'vehiculo' ? null : 'vehiculo')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${chatContext === 'vehiculo' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-[#121c27] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              🚗 Vehículo
            </button>
          </div>

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
                disabled={isAnalyzing || isConverting}
                className="absolute left-2 p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-[#121c27]/10 disabled:opacity-50 transition-colors z-10"
                title="Adjuntar factura o recibo (Imagen/PDF)"
              >
                {isConverting ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : <Paperclip className="w-4 h-4" />}
              </button>
              <input 
                type="text"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder={
                  chatContext === 'gasto' ? '[Modo Gasto]: Gasté 15 en comida...' :
                  chatContext === 'ingreso' ? '[Modo Ingreso]: Recibí 50 por venta...' :
                  chatContext === 'vehiculo' ? '[Modo Vehículo]: Cambié el aceite del Yaris por 60...' :
                  'Selecciona arriba o escribe: Gasté 15 en Súper 99...'
                }
                className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-black/30 shadow-sm text-sm font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  chatContext === 'gasto' ? 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500' :
                  chatContext === 'ingreso' ? 'border-emerald-500/50 focus:ring-emerald-500/50 focus:border-emerald-500' :
                  chatContext === 'vehiculo' ? 'border-blue-500/50 focus:ring-blue-500/50 focus:border-blue-500' :
                  'border-emerald-500/30 focus:ring-emerald-500/50 focus:border-emerald-500'
                }`}
                disabled={isAnalyzing}
              />
              <button 
                type="submit" 
                disabled={isAnalyzing || isConverting || (!aiText.trim() && !aiFile)}
                className="absolute right-2 p-2 rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-300 transition-colors z-10"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            
            {/* File Thumbnail Indicator */}
            {/* Estado de procesamiento */}
            {(isConverting || isAnalyzing) && (
              <div className="w-full mt-2 flex items-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  isAnalyzing
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAnalyzing ? '🧠 Analizando factura con IA...' : convertStatus || 'Procesando...'}</span>
                </div>
              </div>
            )}
            {aiFile && !isConverting && (
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

        {/* ── Pill-tab groups ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* FINANZAS */}
          <QuickActionGroup
            label="💰 Finanzas"
            color="emerald"
            options={[
              { id: 'ingreso', label: 'Ingreso', icon: <Banknote className="w-3.5 h-3.5" /> },
              { id: 'gasto',   label: 'Gasto',   icon: <Wallet className="w-3.5 h-3.5" /> },
              { id: 'pago-fijo', label: 'Pago Fijo', icon: <Calendar className="w-3.5 h-3.5" /> },
            ]}
            onSelect={(id) => setActiveModal(id)}
          />

          {/* VEHÍCULO */}
          <QuickActionGroup
            label="🚗 Vehículo"
            color="blue"
            options={[
              { id: 'km',           label: 'Kilometraje',  icon: <Car className="w-3.5 h-3.5" /> },
              { id: 'mantenimiento',label: 'Mantenimiento',icon: <Wrench className="w-3.5 h-3.5" /> },
              { id: 'pendiente',    label: 'Pendiente',    icon: <FileText className="w-3.5 h-3.5" /> },
            ]}
            onSelect={(id) => setActiveModal(id)}
          />

          {/* HOGAR & METAS */}
          <QuickActionGroup
            label="🏠 Hogar & Metas"
            color="teal"
            options={[
              { id: 'hogar', label: 'Tarea Hogar', icon: <Home className="w-3.5 h-3.5" /> },
              { id: 'meta',  label: 'Nueva Meta',  icon: <Target className="w-3.5 h-3.5" /> },
            ]}
            onSelect={(id) => setActiveModal(id)}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Main Balance Card */}
          <section
            className="relative bg-[#0d131f]/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl border border-emerald-500/30"
            data-purpose="main-balance"
          >
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 p-24 bg-teal-500/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121c27]/10 text-emerald-50 text-xs font-semibold backdrop-blur-sm border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Total Pagado (Mes Actual)
                </span>
                <Link href="/consultas" className="w-8 h-8 rounded-full bg-[#121c27]/10 hover:bg-[#121c27]/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/5">
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
                <div className="bg-[#121c27]/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-emerald-100/80 text-xs font-medium uppercase tracking-wider mb-1">
                    Pendiente por Pagar
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {formatCurrency(pendientePorPagar)}
                  </p>
                </div>
                <div className="bg-[#121c27]/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
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
            <Link href="/gastos-diarios" className="bg-[#121c27]/85 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/20 shadow-sm hover:border-emerald-500/50 transition-all group flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <span className="text-gray-500 group-hover:text-rose-400 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gastos Diarios</p>
              <p className="text-lg font-extrabold text-white mt-auto">{formatCurrency(metrics.dailyExpenses)}</p>
            </Link>

            <Link href="/gastos-diarios" className="bg-[#121c27]/85 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/20 shadow-sm hover:border-emerald-500/50 transition-all group flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400 border border-orange-500/30">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className="text-gray-500 group-hover:text-orange-400 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Restaurante</p>
              <div className="flex items-baseline gap-1 mt-auto">
                <p className="text-lg font-extrabold text-white">{formatCurrency(metrics.restauranteSpent)}</p>
                <span className="text-xs text-gray-500 font-medium ml-1">gastado</span>
              </div>
            </Link>

            <Link href="/gastos-diarios" className="bg-[#121c27]/85 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/20 shadow-sm hover:border-emerald-500/50 transition-all group flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-violet-500/20 rounded-xl text-violet-400 border border-violet-500/30">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-gray-500 group-hover:text-violet-400 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Uso Tarjeta Crédito</p>
              <p className="text-lg font-extrabold text-white mt-auto">{formatCurrency(metrics.creditCardTotal)}</p>
            </Link>
          </section>

          {/* Couple Breakdown */}
          <section className="bg-[#121c27]/85 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-emerald-500/20 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              Desglose por Cónyuge
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupleBreakdown.map((person) => {
                const isCf = person.id === 'cristhian';
                const hoverClass = isCf ? "hover:border-emerald-400/50" : "hover:border-pink-400/50";
                const initialsColor = isCf ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-pink-500/20 border-pink-500/30 text-pink-400";
                const effectiveBoxBorder = isCf ? "border-emerald-500/30 bg-emerald-500/10" : "border-pink-500/30 bg-pink-500/10";
                const effectiveBoxText = isCf ? "text-emerald-400" : "text-pink-400";
                const subtitle = isCf ? "Salarios & Gastos de Representación" : "Salario base, Carro & Comisión Meta";

                return (
                  <div key={person.id} className={`bg-black/20 rounded-2xl p-5 sm:p-6 border border-white/10 shadow-sm flex flex-col justify-between transition-all ${hoverClass}`}>
                    <div>
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold shrink-0 ${initialsColor}`}>
                            {person.initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white text-sm sm:text-base leading-tight truncate">{person.name}</h3>
                            <span className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 sm:truncate">{subtitle}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1.5 rounded-full bg-[#121c27]/10 text-[10px] sm:text-xs text-gray-300 font-semibold whitespace-nowrap shrink-0">{person.abonos || 0} Abonos</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-5 p-2 sm:p-3 rounded-xl bg-[#121c27]/5 border border-white/5 text-center">
                        <div className="px-0.5 sm:px-1">
                          <div className="text-[9px] sm:text-[11px] font-medium text-gray-400 truncate">Proyectado</div>
                          <div className="text-[10px] sm:text-sm font-semibold font-mono text-white mt-0.5 tracking-tight">{formatCurrency(person.projected || 0)}</div>
                        </div>
                        <div className={`rounded-lg py-1 shadow-sm border px-0.5 sm:px-1 ${effectiveBoxBorder}`}>
                          <div className={`text-[9px] sm:text-[11px] font-medium truncate ${effectiveBoxText}`}>Efectivo</div>
                          <div className={`text-[10px] sm:text-sm font-bold font-mono mt-0.5 tracking-tight ${effectiveBoxText}`}>{formatCurrency(person.incomes || 0)}</div>
                        </div>
                        <div className="px-0.5 sm:px-1">
                          <div className="text-[9px] sm:text-[11px] font-medium text-gray-400 truncate">Pendiente</div>
                          <div className="text-[10px] sm:text-sm font-medium font-mono text-gray-300 mt-0.5 tracking-tight">{formatCurrency(person.pending || 0)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">Asignaciones / Gastos</span>
                        <span className="font-bold text-rose-400">-{formatCurrency(person.expenses || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-300 uppercase">Saldo Neto (Bolsillo)</span>
                        <span className={`text-sm font-extrabold ${(person.balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
          <div className="bg-[#121c27]/85 backdrop-blur-md rounded-3xl p-5 border border-emerald-500/20 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Próximos Pagos
              </h3>
              <Link href="/pagos-fijos" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingBills.length > 0 ? upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center p-3 rounded-2xl hover:bg-[#121c27]/5 transition-colors border border-transparent hover:border-white/10 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 mr-3 ${bill.colorClass}`}>
                    {bill.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{bill.title}</p>
                    <p className={`text-xs font-medium truncate ${bill.daysRemaining <= 3 ? 'text-rose-400 font-bold' : 'text-gray-400'}`}>
                      {bill.subtitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-extrabold text-white">{formatCurrency(bill.amount)}</p>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center bg-black/20 rounded-2xl border border-white/5">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold text-gray-300">¡Todo al día!</p>
                  <p className="text-xs text-gray-500">No hay pagos próximos vencidos.</p>
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
