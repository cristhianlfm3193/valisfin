'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart, RefreshCcw, ChevronDown, SlidersHorizontal, DollarSign, Wallet, Ticket, Package, Repeat as RepeatIcon, ArrowUpRight, Info as InfoIcon, Trophy, Megaphone, TrendingUp
} from 'lucide-react';

export default function EstadisticasPage() {
  const [period, setPeriod] = useState('mes');
  const [showExport, setShowExport] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, title: '', rev: '', net: '' });
  
  const [loading, setLoading] = useState(true);
  const [rawVentas, setRawVentas] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: vData } = await supabase
      .from('valisven_ventas')
      .select(`
        *,
        licencia_activa:valisven_licencias_activas(
          *,
          producto_info:valisven_licencias(*)
        )
      `)
      .order('fecha', { ascending: true }); // Ascending to help with chart bucketing
      
    if (vData) setRawVentas(vData);
    setLoading(false);
  };

  const handleBarHover = (e: React.MouseEvent, title: string, rev: string, net: string) => {
    setTooltip({
      show: true,
      x: e.clientX + 15,
      y: e.clientY - 50,
      title,
      rev,
      net
    });
  };

  const handleBarLeave = () => setTooltip({ ...tooltip, show: false });

  // 1. FILTERING
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startOfWeek = new Date(startOfDay);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  const filteredVentas = rawVentas.filter(v => {
    const vDate = new Date(v.fecha);
    if (period === 'dia') return vDate >= startOfDay;
    if (period === 'semana') return vDate >= startOfWeek;
    if (period === 'mes') return vDate >= startOfMonth;
    if (period === 'ano') return vDate >= startOfYear;
    return true;
  });

  // 2. KPI CALCULATIONS
  const gross = filteredVentas.reduce((sum, v) => sum + parseFloat(v.costo_venta || 0), 0);
  const net = filteredVentas.reduce((sum, v) => sum + parseFloat(v.ganancia_neta || 0), 0);
  const cost = filteredVentas.reduce((sum, v) => sum + parseFloat(v.costo_distribuidor || 0), 0);
  const units = filteredVentas.length;
  
  const renewals = filteredVentas.filter(v => v.tipo_venta === 'Renovación').length;
  const retPercent = units > 0 ? ((renewals / units) * 100).toFixed(1) : '0.0';
  const marginPercent = gross > 0 ? ((net / gross) * 100).toFixed(1) : '0.0';
  const costPercent = gross > 0 ? ((cost / gross) * 100).toFixed(1) : '0.0';

  // Format Helpers
  const fmt = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 3. DONUT CHART (Ingresos por Tipo)
  const categoryTotals: Record<string, number> = {};
  filteredVentas.forEach(v => {
    const tipo = v.licencia_activa?.producto_info?.tipo?.toLowerCase() || 'otros';
    let cat = 'otros';
    if (tipo.includes('svod')) cat = 'Streaming Premium';
    else if (tipo.includes('software')) cat = 'Office & Windows';
    else if (tipo.includes('ai')) cat = 'Inteligencia Artificial';
    else if (tipo.includes('música') || tipo.includes('musica')) cat = 'Música';
    else if (tipo.includes('seguridad')) cat = 'Ciberseguridad';
    
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(v.costo_venta || 0);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const top3Categories = sortedCategories.slice(0, 3);
  
  // Calculate SVG Strokes (Total circumference = 2 * PI * 38 = 238.76)
  const CIRC = 238.76;
  let currentOffset = 0;
  const donutRings = top3Categories.map(([name, val], i) => {
    const pct = gross > 0 ? (val / gross) : 0;
    const dash = pct * CIRC;
    const gap = CIRC - dash;
    const ring = {
      name,
      val,
      pctText: (pct * 100).toFixed(0) + '%',
      strokeDasharray: `${dash} ${gap}`,
      strokeDashoffset: -currentOffset,
      colorClass: i === 0 ? 'text-amber-400' : i === 1 ? 'text-cyan-400' : 'text-emerald-400',
      strokeColor: i === 0 ? '#f59e0b' : i === 1 ? '#06b6d4' : '#10b981',
      bgClass: i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-cyan-400' : 'bg-emerald-400',
      shadowClass: i === 0 ? 'shadow-[0_0_8px_rgba(245,158,11,0.6)]' : i === 1 ? 'shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'shadow-[0_0_8px_rgba(16,185,129,0.6)]'
    };
    currentOffset += dash;
    return ring;
  });
  const lider = donutRings.length > 0 ? donutRings[0] : null;

  // 4. MATRIX TABLE
  const productTotals: Record<string, { facturado: number, neto: number }> = {};
  filteredVentas.forEach(v => {
    const pName = v.licencia_activa?.producto_info?.producto || 'Desconocido';
    if (!productTotals[pName]) productTotals[pName] = { facturado: 0, neto: 0 };
    productTotals[pName].facturado += parseFloat(v.costo_venta || 0);
    productTotals[pName].neto += parseFloat(v.ganancia_neta || 0);
  });
  const sortedProducts = Object.entries(productTotals).sort((a, b) => b[1].facturado - a[1].facturado);

  // 5. MAIN SVG CHART (Dynamic Bucketing)
  // We will divide the filtered data into 6 buckets.
  const bucketCount = 6;
  const buckets = Array(bucketCount).fill(0).map(() => ({ title: '', gross: 0, net: 0, cost: 0 }));
  
  if (filteredVentas.length > 0) {
    let startT = 0;
    let endT = 0;
    
    if (period === 'dia') {
      startT = startOfDay.getTime();
      endT = startT + 86400000;
      const step = (endT - startT) / bucketCount;
      buckets.forEach((b, i) => b.title = `${String(Math.floor(i * 4)).padStart(2, '0')}:00 - ${String(Math.floor((i+1) * 4)).padStart(2, '0')}:00`);
      filteredVentas.forEach(v => {
        const t = new Date(v.fecha).getTime();
        const idx = Math.min(bucketCount - 1, Math.floor((t - startT) / step));
        if(idx >= 0) {
            buckets[idx].gross += parseFloat(v.costo_venta || 0);
            buckets[idx].net += parseFloat(v.ganancia_neta || 0);
            buckets[idx].cost += parseFloat(v.costo_distribuidor || 0);
        }
      });
    } else if (period === 'semana') {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      buckets.forEach((b, i) => b.title = days[(startOfWeek.getDay() + i) % 7]);
      filteredVentas.forEach(v => {
        const d = new Date(v.fecha);
        const idx = Math.floor((d.getTime() - startOfWeek.getTime()) / 86400000);
        if (idx >= 0 && idx < bucketCount) {
          buckets[idx].gross += parseFloat(v.costo_venta || 0);
          buckets[idx].net += parseFloat(v.ganancia_neta || 0);
          buckets[idx].cost += parseFloat(v.costo_distribuidor || 0);
        }
      });
    } else if (period === 'mes') {
      buckets[0].title = 'Sem 1'; buckets[1].title = 'Sem 2'; buckets[2].title = 'Sem 3'; buckets[3].title = 'Sem 4'; buckets[4].title = 'Cierre'; buckets[5].title = 'Proy';
      filteredVentas.forEach(v => {
        const date = new Date(v.fecha).getDate();
        let idx = 0;
        if (date > 7 && date <= 14) idx = 1;
        else if (date > 14 && date <= 21) idx = 2;
        else if (date > 21 && date <= 28) idx = 3;
        else if (date > 28) idx = 4;
        buckets[idx].gross += parseFloat(v.costo_venta || 0);
        buckets[idx].net += parseFloat(v.ganancia_neta || 0);
        buckets[idx].cost += parseFloat(v.costo_distribuidor || 0);
      });
    } else {
      // YTD
      buckets[0].title = 'Ene-Feb'; buckets[1].title = 'Mar-Abr'; buckets[2].title = 'May-Jun'; buckets[3].title = 'Jul-Ago'; buckets[4].title = 'Sep-Oct'; buckets[5].title = 'Nov-Dic';
      filteredVentas.forEach(v => {
        const m = new Date(v.fecha).getMonth();
        const idx = Math.min(bucketCount - 1, Math.floor(m / 2));
        buckets[idx].gross += parseFloat(v.costo_venta || 0);
        buckets[idx].net += parseFloat(v.ganancia_neta || 0);
        buckets[idx].cost += parseFloat(v.costo_distribuidor || 0);
      });
    }
  }
  
  const maxGross = Math.max(...buckets.map(b => b.gross), 100); // minimum 100 to avoid div by zero
  const svgHeight = 150; // Use available height between y=50 and y=200 for plotting
  const getY = (val: number) => 200 - (val / maxGross) * svgHeight;

  let emeraldPathD = '';
  let rosePathD = '';
  const xPoints = [89, 189, 289, 389, 489, 589];
  
  if (buckets.some(b => b.gross > 0)) {
    // Generate curved paths using quadratic beziers
    const generatePath = (type: 'net' | 'cost') => {
      let d = `M ${xPoints[0]} ${getY(buckets[0][type])}`;
      for (let i = 0; i < bucketCount - 1; i++) {
        const xAvg = (xPoints[i] + xPoints[i+1]) / 2;
        d += ` Q ${xPoints[i]} ${getY(buckets[i][type])}, ${xAvg} ${(getY(buckets[i][type]) + getY(buckets[i+1][type])) / 2}`;
        d += ` T ${xPoints[i+1]} ${getY(buckets[i+1][type])}`;
      }
      return d;
    };
    emeraldPathD = generatePath('net');
    rosePathD = generatePath('cost');
  }

  // Find the index with the maximum gross to highlight as "Pico"
  const maxIdx = buckets.reduce((maxI, b, i, arr) => b.gross > arr[maxI].gross ? i : maxI, 0);

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Power BI Control Bar / Header Action Bar */}
      <section className="w-full bg-slate-950/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Title & Export Utility */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                DASHBOARD
              </span>
            </div>
          </div>
        </div>
        
        {/* Power BI Slicer Controls Row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-center pt-2 relative z-10">
          <div className="xl:col-span-6 flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 shadow-inner">
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${period === 'dia' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25' : 'text-slate-400 hover:text-amber-200'}`}
              onClick={() => setPeriod('dia')}
            >Día (24h)</button>
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${period === 'semana' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25' : 'text-slate-400 hover:text-amber-200'}`}
              onClick={() => setPeriod('semana')}
            >Semana</button>
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${period === 'mes' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25' : 'text-slate-400 hover:text-amber-200'}`}
              onClick={() => setPeriod('mes')}
            >Mes Actual</button>
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${period === 'ano' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/25' : 'text-slate-400 hover:text-amber-200'}`}
              onClick={() => setPeriod('ano')}
            >Año Actual</button>
          </div>
          
          <div className="xl:col-span-3 relative opacity-50 cursor-not-allowed">
            <select disabled className="w-full appearance-none bg-slate-900/90 text-slate-400 text-xs rounded-lg px-3.5 py-2.5 pr-9 shadow-inner focus:outline-none text-left">
              <option value="todas">Categoría: Todas (Auto)</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-slate-600 w-4 h-4 pointer-events-none" />
          </div>
          
          <div className="xl:col-span-3 relative opacity-50 cursor-not-allowed">
            <select disabled className="w-full appearance-none bg-slate-900/90 text-slate-400 text-xs rounded-lg px-3.5 py-2.5 pr-9 shadow-inner focus:outline-none text-left">
              <option value="todos">Canal: Todos (Auto)</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-2.5 text-slate-600 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Executive KPI Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-950/75 backdrop-blur-md rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:bg-slate-900/70 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Facturación Bruta</span>
              <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-amber-400 font-bold">B/.</span>
              <span className="text-2xl text-white font-bold tracking-tight font-mono">{fmt(gross)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-emerald-400 text-xs">
            <span className="flex items-center font-bold">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Tiempo real
            </span>
            <span className="text-slate-400">{period.toUpperCase()}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-950/75 backdrop-blur-md rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:bg-slate-900/70 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Ganancia Neta Real</span>
              <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-emerald-400 font-bold">B/.</span>
              <span className="text-2xl text-white font-bold tracking-tight font-mono">{fmt(net)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 font-mono font-bold text-[10px]">Margen: {marginPercent}%</span>
            <span className="text-emerald-400 font-bold">Líquido</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-950/75 backdrop-blur-md rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:bg-slate-900/70 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Unidades Vendidas</span>
              <div className="w-7 h-7 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl text-white font-bold tracking-tight font-mono">{units}</span>
              <span className="text-xs text-slate-400">activas</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-cyan-300 text-xs">
            <span className="flex items-center font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Total
            </span>
            <span className="text-slate-400">Licencias</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-950/75 backdrop-blur-md rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:bg-slate-900/70 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Costo Proveedores</span>
              <div className="w-7 h-7 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-400">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-rose-400 font-bold">B/.</span>
              <span className="text-2xl text-white font-bold tracking-tight font-mono">{fmt(cost)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-slate-400 text-xs">
            <span>{costPercent}% de Ingreso</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-950/75 backdrop-blur-md rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:bg-slate-900/70 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Retención & LTV</span>
              <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400">
                <RepeatIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl text-amber-300 font-bold tracking-tight font-mono">{retPercent}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-bold flex items-center">Renovaciones</span>
            <span className="text-slate-400">{renewals} ventas</span>
          </div>
        </div>
      </section>

      {/* Analytical Visualizations Grid 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Interactive BI Combo Chart */}
        <div className="lg:col-span-8 bg-slate-950/80 backdrop-blur-md rounded-xl p-4 shadow-xl flex flex-col justify-between relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <h3 className="text-lg text-white font-bold">Curva de Ingresos, Costos & Utilidad Neta</h3>
              </div>
              <p className="text-sm text-slate-400">Vista temporal acumulada interactiva con comparativa de margen</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500"></span><span className="text-slate-300">Facturación</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400"></span><span className="text-slate-300">Neta</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-rose-400"></span><span className="text-slate-300">Costo</span></div>
            </div>
          </div>
          
          <div className="relative w-full h-72 flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 250">
              <defs>
                <linearGradient id="amberBarGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9"></stop>
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.3"></stop>
                </linearGradient>
                <linearGradient id="emeraldArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35"></stop>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"></stop>
                </linearGradient>
                <filter height="140%" id="amberGlow" width="140%" x="-20%" y="-20%">
                  <feGaussianBlur result="glow" stdDeviation="3"></feGaussianBlur>
                  <feComposite in="SourceGraphic" in2="glow" operator="over"></feComposite>
                </filter>
              </defs>
              <line stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.3" x1="40" x2="720" y1="30" y2="30"></line>
              <line stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.3" x1="40" x2="720" y1="85" y2="85"></line>
              <line stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.3" x1="40" x2="720" y1="140" y2="140"></line>
              <line stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.3" x1="40" x2="720" y1="195" y2="195"></line>
              
              <text fill="#94a3b8" fontFamily="monospace" fontSize="10" textAnchor="end" x="32" y="34">B/. {fmt(maxGross)}</text>
              <text fill="#94a3b8" fontFamily="monospace" fontSize="10" textAnchor="end" x="32" y="89">B/. {fmt(maxGross * 0.75)}</text>
              <text fill="#94a3b8" fontFamily="monospace" fontSize="10" textAnchor="end" x="32" y="144">B/. {fmt(maxGross * 0.5)}</text>
              <text fill="#94a3b8" fontFamily="monospace" fontSize="10" textAnchor="end" x="32" y="199">B/. {fmt(maxGross * 0.25)}</text>
              
              {buckets.map((b, i) => {
                const isMax = i === maxIdx && b.gross > 0;
                const barHeight = Math.max((b.gross / maxGross) * svgHeight, 5);
                const barY = 200 - barHeight;
                const fillOpacity = isMax ? '1' : '0.8';
                return (
                  <g key={`bar-${i}`}>
                    <rect 
                      className="hover:opacity-100 transition-opacity cursor-pointer" 
                      style={{ opacity: fillOpacity }}
                      onMouseEnter={(e) => handleBarHover(e, b.title, `B/. ${fmt(b.gross)}`, `B/. ${fmt(b.net)}`)} 
                      onMouseLeave={handleBarLeave} 
                      fill="url(#amberBarGrad)" 
                      height={barHeight} 
                      rx="4" 
                      width="28" 
                      x={xPoints[i] - 14} 
                      y={barY}
                    ></rect>
                  </g>
                );
              })}
              
              {emeraldPathD && (
                <>
                  <path d={`${emeraldPathD} L ${xPoints[bucketCount-1]} 200 L ${xPoints[0]} 200 Z`} fill="url(#emeraldArea)"></path>
                  <path d={emeraldPathD} fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="3"></path>
                  <path d={rosePathD} fill="none" stroke="#f43f5e" strokeDasharray="4 4" strokeWidth="2"></path>
                  
                  {buckets.map((b, i) => {
                    const isMax = i === maxIdx && b.gross > 0;
                    return (
                      <circle 
                        key={`circle-${i}`}
                        cx={xPoints[i]} 
                        cy={getY(b.net)} 
                        fill={isMax ? "#10b981" : "#059669"} 
                        r={isMax ? "5.5" : "4.5"} 
                        stroke={isMax ? "#fef08a" : "#fff"} 
                        strokeWidth={isMax ? "2" : "1.5"}
                        filter={isMax ? "url(#amberGlow)" : undefined}
                      ></circle>
                    );
                  })}
                </>
              )}
              
              {buckets.map((b, i) => {
                const isMax = i === maxIdx && b.gross > 0;
                return (
                  <text 
                    key={`text-${i}`}
                    fill={isMax ? "#fbbf24" : "#94a3b8"} 
                    fontFamily="sans-serif" 
                    fontSize="10" 
                    fontWeight={isMax ? "bold" : "normal"}
                    textAnchor="middle" 
                    x={xPoints[i]} 
                    y="222"
                  >
                    {b.title}{isMax ? ' (Pico)' : ''}
                  </text>
                );
              })}
            </svg>
            
            {tooltip.show && (
              <div 
                className="absolute bg-slate-900/95 text-white p-3 rounded-lg shadow-2xl z-20 text-xs pointer-events-none"
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                <p className="font-bold text-amber-400 mb-1">{tooltip.title}</p>
                <div className="flex justify-between gap-3 text-slate-300"><span>Facturación:</span> <span className="font-mono font-bold text-white">{tooltip.rev}</span></div>
                <div className="flex justify-between gap-3 text-slate-300"><span>Utilidad Neta:</span> <span className="font-mono font-bold text-emerald-300">{tooltip.net}</span></div>
              </div>
            )}
          </div>
          
          <div className="mt-2 pt-2 flex items-center justify-between text-slate-400 text-xs border-t border-slate-800/50">
            <span className="flex items-center gap-1">
              <InfoIcon className="w-3.5 h-3.5 text-amber-400" /> Pico en el periodo: {buckets[maxIdx]?.title || 'N/A'}
            </span>
            <span className="text-amber-400/90 font-mono font-semibold">Conversión: N/A</span>
          </div>
        </div>
        
        {/* Power BI Donut Ring Chart */}
        <div className="lg:col-span-4 bg-slate-950/80 backdrop-blur-md rounded-xl p-4 shadow-xl flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg text-white font-bold">Ingresos por Tipo</h3>
              <p className="text-sm text-slate-400">Participación en ventas</p>
            </div>
            <span className="px-2 py-1 rounded bg-slate-900 text-amber-300 font-mono text-xs font-semibold">B/. {fmt(gross)}</span>
          </div>
          
          <div className="relative flex items-center justify-center my-3">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="38" stroke="#1e293b" strokeWidth="12"></circle>
              {donutRings.map((r, i) => (
                <circle 
                  key={`ring-${i}`}
                  className="transition-all cursor-pointer hover:opacity-80" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="38" 
                  stroke={r.strokeColor}
                  strokeDasharray={r.strokeDasharray} 
                  strokeDashoffset={r.strokeDashoffset} 
                  strokeWidth="12"
                ></circle>
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">Líder</span>
              <span className="text-2xl font-extrabold text-white leading-none mt-0.5">{lider ? lider.pctText : '0%'}</span>
              <span className="text-amber-400 font-semibold text-[11px] mt-1">{lider ? lider.name : 'N/A'}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {donutRings.map((r, i) => (
              <div key={`legend-${i}`} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${r.bgClass} ${r.shadowClass}`}></span>
                  <span className="text-sm text-slate-200">{r.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-white font-bold">B/. {fmt(r.val)}</span>
                  <span className={`${r.colorClass} font-mono text-xs ml-1.5 font-bold`}>{r.pctText}</span>
                </div>
              </div>
            ))}
            {donutRings.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-4">No hay datos en el periodo</div>
            )}
          </div>
        </div>
      </section>

      {/* Breakdown Matrix / Detailed Operational Table */}
      <section className="w-full bg-slate-950/80 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg text-white font-bold">Matriz de Cumplimiento vs Objetivo Proyectado</h3>
            <p className="text-sm text-slate-400">Desglose granular por subcategoría de producto</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Promedio: {marginPercent}%
            </span>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider bg-slate-900/60 border-b border-white/5">
                <th className="py-3 px-4 rounded-tl-lg">Solución</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4 text-right">Facturado</th>
                <th className="py-3 px-4 text-right">Utilidad Neta</th>
                <th className="py-3 px-4 text-center">Margen</th>
                <th className="py-3 px-4 text-center rounded-tr-lg">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 text-sm">
              {sortedProducts.map(([pName, totals], i) => {
                const colorMap = ['bg-amber-400', 'bg-cyan-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-purple-400'];
                const dotColor = colorMap[i % colorMap.length];
                const pMargin = totals.facturado > 0 ? (totals.neto / totals.facturado) * 100 : 0;
                
                let stateTag = <span className="px-2 py-1 rounded-full bg-slate-900 text-slate-400 text-[11px] font-bold">Regular</span>;
                if (pMargin > 65) stateTag = <span className="px-2 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-[11px] font-bold">Excelente</span>;
                else if (pMargin > 50) stateTag = <span className="px-2 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-[11px] font-bold">Superado</span>;
                else if (pMargin > 30) stateTag = <span className="px-2 py-1 rounded-full bg-amber-950/60 text-amber-300 text-[11px] font-bold">En Meta</span>;

                return (
                  <tr key={`prod-${i}`} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span> {pName}
                    </td>
                    <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-semibold">N/A</span></td>
                    <td className="py-3.5 px-4 text-right font-mono text-white font-bold">B/. {fmt(totals.facturado)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">B/. {fmt(totals.neto)}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-emerald-300">{pMargin.toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-center">{stateTag}</td>
                  </tr>
                );
              })}
              {sortedProducts.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500">No hay ventas registradas en el periodo seleccionado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
