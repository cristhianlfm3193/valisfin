'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Target, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import type { MetaSupervisor, ResumenMensualVendedor } from '@/types/valisbiz';

// Tipos
interface RegistroFacturado {
  id: string;
  vendedor_nombre: string;
  fecha: string;
  monto: number;
  contado: number;
  credito: number;
}

interface RegistroVendido {
  id: string;
  vendedor_nombre: string;
  fecha: string;
  monto: number;
  vistas: number;
  con_compra: number;
  sin_compra: number;
  contado: number;
  credito: number;
}

interface Props {
  registrosFacturado: RegistroFacturado[];
  registrosVendido: RegistroVendido[];
  metas: MetaSupervisor;
  resumenMensual: ResumenMensualVendedor[];
}

const COLORS = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
const PIE_COLORS_TIPO = ['#10b981', '#3b82f6']; // Contado, Credito
const PIE_COLORS_VISITAS = ['#ec4899', '#64748b']; // Con compra, Sin compra

function fmt(n: number) {
  return n.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EstadisticasPowerBI({ registrosFacturado, registrosVendido, metas, resumenMensual }: Props) {
  // Filtros Globales
  const [selectedVendedor, setSelectedVendedor] = useState<string>('Todos');
  const [tipoVenta, setTipoVenta] = useState<'Todos' | 'Contado' | 'Credito'>('Todos');
  const [timeFilter, setTimeFilter] = useState<'Año' | 'Mes' | 'Día'>('Día');

  // Obtener lista única de vendedores
  const vendedoresDisponibles = useMemo(() => {
    const vSet = new Set<string>();
    registrosFacturado.forEach(r => vSet.add(r.vendedor_nombre.split(' ')[0]));
    registrosVendido.forEach(r => vSet.add(r.vendedor_nombre.split(' ')[0]));
    return Array.from(vSet);
  }, [registrosFacturado, registrosVendido]);

  // --- FILTRADO DE DATOS GLOBALES ---
  const filteredFacturado = useMemo(() => {
    return registrosFacturado.filter(r => {
      const v = r.vendedor_nombre.split(' ')[0];
      if (selectedVendedor !== 'Todos' && v !== selectedVendedor) return false;
      return true;
    });
  }, [registrosFacturado, selectedVendedor]);

  const filteredVendido = useMemo(() => {
    return registrosVendido.filter(r => {
      const v = r.vendedor_nombre.split(' ')[0];
      if (selectedVendedor !== 'Todos' && v !== selectedVendedor) return false;
      return true;
    });
  }, [registrosVendido, selectedVendedor]);

  // --- KPIs ---
  const totalFacturado = useMemo(() => {
    return filteredFacturado.reduce((sum, curr) => {
      if (tipoVenta === 'Contado') return sum + curr.contado;
      if (tipoVenta === 'Credito') return sum + curr.credito;
      return sum + curr.monto;
    }, 0);
  }, [filteredFacturado, tipoVenta]);

  const totalReportado = useMemo(() => {
    return filteredVendido.reduce((sum, curr) => {
      if (tipoVenta === 'Contado') return sum + curr.contado;
      if (tipoVenta === 'Credito') return sum + curr.credito;
      return sum + curr.monto;
    }, 0);
  }, [filteredVendido, tipoVenta]);

  const brechaGlobal = totalFacturado - totalReportado;
  
  // Meta depende si está filtrado o no
  const metaActual = useMemo(() => {
    if (selectedVendedor === 'Todos') return metas.cuota_global || 1;
    const rev = resumenMensual.find(r => r.nombre.split(' ')[0] === selectedVendedor);
    return rev?.cuota_mensual || 1;
  }, [selectedVendedor, metas.cuota_global, resumenMensual]);

  const porcentajeCumplimiento = Math.min((totalFacturado / metaActual) * 100, 100);

  // --- Datos para Gráfico de Barras Agrupadas (Comparativa) ---
  const barChartData = useMemo(() => {
    const dataByVendedor: Record<string, { name: string; facturado: number; reportado: number }> = {};
    vendedoresDisponibles.forEach(v => {
      if (selectedVendedor !== 'Todos' && v !== selectedVendedor) return;
      dataByVendedor[v] = { name: v, facturado: 0, reportado: 0 };
    });

    filteredFacturado.forEach(r => {
      const v = r.vendedor_nombre.split(' ')[0];
      if (dataByVendedor[v]) {
        let amt = r.monto;
        if (tipoVenta === 'Contado') amt = r.contado;
        if (tipoVenta === 'Credito') amt = r.credito;
        dataByVendedor[v].facturado += amt;
      }
    });

    filteredVendido.forEach(r => {
      const v = r.vendedor_nombre.split(' ')[0];
      if (dataByVendedor[v]) {
        let amt = r.monto;
        if (tipoVenta === 'Contado') amt = r.contado;
        if (tipoVenta === 'Credito') amt = r.credito;
        dataByVendedor[v].reportado += amt;
      }
    });

    return Object.values(dataByVendedor);
  }, [filteredFacturado, filteredVendido, vendedoresDisponibles, selectedVendedor, tipoVenta]);

  // --- Datos para Gráfico de Visitas (Comparativa) ---
  const barChartVisitasData = useMemo(() => {
    const dataByVendedor: Record<string, { name: string; conCompra: number; sinCompra: number }> = {};
    vendedoresDisponibles.forEach(v => {
      if (selectedVendedor !== 'Todos' && v !== selectedVendedor) return;
      dataByVendedor[v] = { name: v, conCompra: 0, sinCompra: 0 };
    });

    filteredVendido.forEach(r => {
      const v = r.vendedor_nombre.split(' ')[0];
      if (dataByVendedor[v]) {
        dataByVendedor[v].conCompra += r.con_compra;
        dataByVendedor[v].sinCompra += r.sin_compra;
      }
    });

    return Object.values(dataByVendedor);
  }, [filteredVendido, vendedoresDisponibles, selectedVendedor]);

  // --- Datos para Gráfico de Área (Tendencia Diaria/Semanal/Mensual) ---
  const areaChartData = useMemo(() => {
    const dataMap = new Map<string, any>();

    filteredFacturado.forEach(r => {
      let key = '';
      let displayDate = '';
      
      const dateObj = new Date(`${r.fecha}T12:00:00Z`);

      if (timeFilter === 'Año') {
        key = r.fecha.substring(0, 7); // YYYY-MM
        const monthName = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(dateObj);
        displayDate = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      } else if (timeFilter === 'Mes') {
        const week = Math.ceil(dateObj.getUTCDate() / 7);
        key = `${r.fecha.substring(0, 7)}-W${week}`;
        displayDate = `Sem ${week}`;
      } else {
        key = r.fecha;
        const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(dateObj);
        const dayNum = String(dateObj.getUTCDate()).padStart(2, '0');
        displayDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum}`;
      }

      if (!dataMap.has(key)) {
        const initData: any = { date: displayDate, sortKey: key };
        vendedoresDisponibles.forEach(v => {
          if (selectedVendedor === 'Todos' || v === selectedVendedor) {
            initData[v] = 0;
          }
        });
        dataMap.set(key, initData);
      }

      const v = r.vendedor_nombre.split(' ')[0];
      let amt = r.monto;
      if (tipoVenta === 'Contado') amt = r.contado;
      if (tipoVenta === 'Credito') amt = r.credito;
      
      if (dataMap.get(key)[v] !== undefined) {
        dataMap.get(key)[v] += amt;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredFacturado, vendedoresDisponibles, selectedVendedor, tipoVenta, timeFilter]);

  // --- Datos para Gráfico de Área (Tendencia de Visitas) ---
  const areaChartVisitasData = useMemo(() => {
    const dataMap = new Map<string, any>();

    filteredVendido.forEach(r => {
      const v = r.vendedor_nombre.split(' ')[0];
      if (selectedVendedor !== 'Todos' && v !== selectedVendedor) return;

      let key = '';
      let displayDate = '';
      
      const dateObj = new Date(`${r.fecha}T12:00:00Z`);

      if (timeFilter === 'Año') {
        key = r.fecha.substring(0, 7); // YYYY-MM
        const monthName = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(dateObj);
        displayDate = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      } else if (timeFilter === 'Mes') {
        const week = Math.ceil(dateObj.getUTCDate() / 7);
        key = `${r.fecha.substring(0, 7)}-W${week}`;
        displayDate = `Sem ${week}`;
      } else {
        key = r.fecha;
        const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(dateObj);
        const dayNum = String(dateObj.getUTCDate()).padStart(2, '0');
        displayDate = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum}`;
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { date: displayDate, sortKey: key, conCompra: 0, sinCompra: 0 });
      }

      dataMap.get(key).conCompra += r.con_compra;
      dataMap.get(key).sinCompra += r.sin_compra;
    });

    return Array.from(dataMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [filteredVendido, selectedVendedor, timeFilter]);

  // --- Datos para Donuts ---
  const donutContadoCredito = useMemo(() => {
    const totalC = filteredFacturado.reduce((sum, r) => sum + r.contado, 0);
    const totalCr = filteredFacturado.reduce((sum, r) => sum + r.credito, 0);
    return [
      { name: 'Contado', value: totalC },
      { name: 'Crédito', value: totalCr }
    ];
  }, [filteredFacturado]);

  const donutVisitas = useMemo(() => {
    const conCompra = filteredVendido.reduce((sum, r) => sum + r.con_compra, 0);
    const sinCompra = filteredVendido.reduce((sum, r) => sum + r.sin_compra, 0);
    return [
      { name: 'Con Compra', value: conCompra },
      { name: 'Sin Compra', value: sinCompra }
    ];
  }, [filteredVendido]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* 1. Panel de Filtros Globales */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Vendedor</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedVendedor('Todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedVendedor === 'Todos' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Todos
            </button>
            {vendedoresDisponibles.map(v => (
              <button
                key={v}
                onClick={() => setSelectedVendedor(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedVendedor === v ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200 hidden md:block mx-2" />

        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Venta</label>
          <div className="flex gap-2">
            {['Todos', 'Contado', 'Credito'].map(t => (
              <button
                key={t}
                onClick={() => setTipoVenta(t as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tipoVenta === t ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Agrupación de Tiempo</label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['Año', 'Mes', 'Día'].map(t => (
              <button
                key={t}
                onClick={() => setTimeFilter(t as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${timeFilter === t ? 'bg-white text-emerald-700 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 shadow-none'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-500/10 to-transparent rounded-bl-[100%]" />
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <DollarSign className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Facturado (Finanzas)</span>
          </div>
          <span className="text-2xl font-black text-slate-800 font-mono">B/.{fmt(totalFacturado)}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-[100%]" />
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Reportado (Vendedor)</span>
          </div>
          <span className="text-2xl font-black text-slate-800 font-mono">B/.{fmt(totalReportado)}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br rounded-bl-[100%] ${brechaGlobal > 0 ? 'from-emerald-500/10' : brechaGlobal < 0 ? 'from-red-500/10' : 'from-slate-500/10'}`} />
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            {brechaGlobal > 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
            <span className="text-xs font-bold uppercase tracking-wider">Brecha / GAP</span>
          </div>
          <span className={`text-2xl font-black font-mono ${brechaGlobal > 0 ? 'text-emerald-600' : brechaGlobal < 0 ? 'text-red-600' : 'text-slate-600'}`}>
            {brechaGlobal === 0 ? '—' : `${brechaGlobal > 0 ? '+' : ''}B/.${fmt(brechaGlobal)}`}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-slate-500">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Cumplimiento Meta</span>
            </div>
            <span className="text-lg font-black text-indigo-600">{porcentajeCumplimiento.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${porcentajeCumplimiento}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium text-right mt-1">Meta: B/.{fmt(metaActual)}</p>
        </div>
      </div>

      {/* 3. Fila de Gráficos (Tendencia y Composición) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Tendencia Diaria (Area Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Tendencia de Ventas (Facturado)</h3>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  {vendedoresDisponibles.map((v, idx) => (
                    <linearGradient key={v} id={`color${v}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`B/.${fmt(Number(value))}`, 'Facturado']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                {vendedoresDisponibles.map((v, idx) => (
                  (selectedVendedor === 'Todos' || v === selectedVendedor) && (
                    <Area 
                      key={v} 
                      type="monotone" 
                      dataKey={v} 
                      stroke={COLORS[idx % COLORS.length]} 
                      fillOpacity={1} 
                      fill={`url(#color${v})`} 
                      strokeWidth={3}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  )
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Composición (Donuts) */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-slate-800 mb-2 text-center">Contado vs Crédito</h3>
            <div className="w-full h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutContadoCredito} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                    {donutContadoCredito.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS_TIPO[index % PIE_COLORS_TIPO.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => `B/.${fmt(Number(value))}`} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
            <h3 className="text-sm font-bold text-slate-800 mb-2 text-center">Visitas (Con/Sin Compra)</h3>
            <div className="w-full h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutVisitas} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                    {donutVisitas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS_VISITAS[index % PIE_COLORS_VISITAS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => Number(value)} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tendencia de Visitas (Area Chart) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6">Tendencia de Visitas (Trabajo de Campo)</h3>
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaChartVisitasData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConCompra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PIE_COLORS_VISITAS[0]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={PIE_COLORS_VISITAS[0]} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSinCompra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PIE_COLORS_VISITAS[1]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={PIE_COLORS_VISITAS[1]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [Number(value), 'Visitas']}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Area 
                type="monotone" 
                name="Visitas Con Compra"
                dataKey="conCompra" 
                stroke={PIE_COLORS_VISITAS[0]} 
                fillOpacity={1} 
                fill="url(#colorConCompra)" 
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area 
                type="monotone" 
                name="Visitas Sin Compra"
                dataKey="sinCompra" 
                stroke={PIE_COLORS_VISITAS[1]} 
                fillOpacity={1} 
                fill="url(#colorSinCompra)" 
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Gráficos Comparativos por Vendedor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Comparativa Facturado vs Reportado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Comparativa: Facturado vs Reportado</h3>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => `B/.${fmt(Number(value))}`}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="facturado" name="Facturado (Finanzas)" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="reportado" name="Reportado (Vendedor)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desempeño de Visitas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Desempeño de Visitas (Trabajo de Campo)</h3>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartVisitasData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => Number(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="conCompra" name="Visitas Con Compra" fill={PIE_COLORS_VISITAS[0]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="sinCompra" name="Visitas Sin Compra" fill={PIE_COLORS_VISITAS[1]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
