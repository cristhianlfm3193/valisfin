'use client';

import { useState } from 'react';


import {
  BarChart, RefreshCcw, ChevronDown, SlidersHorizontal, DollarSign, Wallet, Ticket, Package, Repeat as RepeatIcon, ArrowUpRight, Info as InfoIcon, Trophy, Megaphone, TrendingUp
} from 'lucide-react';

export default function EstadisticasPage() {
  const [period, setPeriod] = useState('mes');
  
  const datasets = {
    dia: { gross: '495.00', net: '318.00', units: '21', cost: '177.00', ret: '91.2%' },
    semana: { gross: '3,840.00', net: '2,420.00', units: '168', cost: '1,420.00', ret: '89.4%' },
    mes: { gross: '14,820.00', net: '9,410.00', units: '642', cost: '5,410.00', ret: '88.7%' },
    ano: { gross: '142,650.00', net: '89,400.00', units: '6,180', cost: '53,250.00', ret: '86.5%' },
    custom: { gross: '11,210.00', net: '7,150.00', units: '489', cost: '4,060.00', ret: '87.9%' }
  };
  
  const currentData = datasets[period as keyof typeof datasets] || datasets.mes;
  const [showExport, setShowExport] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, title: '', rev: '', net: '' });

  const handleBarHover = (e: React.MouseEvent, title: string, rev: string, net: string) => {
    const rect = (e.target as Element).getBoundingClientRect();
    // Assuming relative to a container, but for simple React, we use clientX/clientY
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

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Power BI Control Bar / Header Action Bar */}
      <section className="w-full bg-slate-950/80 backdrop-blur-xl rounded-xl p-4 sm:p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Title & Export Utility */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-sm">
              <BarChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-amber-400/90 font-bold">Valis Intelligence Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-[11px] font-semibold">v4.2 BI DirectQuery</span>
              </div>
              <p className="text-lg sm:text-xl text-white font-bold leading-tight">Dashboard Ejecutivo & Desempeño Comercial</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative z-20">
            <button 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors shadow-sm"
              onClick={() => setPeriod('mes')}
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="text-xs font-semibold">Restablecer</span>
            </button>
            <div className="relative inline-block text-left">
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
                onClick={() => setShowExport(!showExport)}
              >
                <span>Exportar Reporte BI</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showExport && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-slate-900 shadow-2xl p-1.5 z-30">
                  <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-200 text-xs font-semibold">PDF Ejecutivo</button>
                  <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-200 text-xs font-semibold">Excel Matriz (.xlsx)</button>
                  <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 text-slate-200 text-xs font-semibold">Power BI PBIX Feed</button>
                </div>
              )}
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
            >2026 YTD</button>
          </div>
          
          <div className="xl:col-span-3 relative">
            <select className="w-full appearance-none bg-slate-900/90 hover:bg-slate-900 text-slate-200 text-xs rounded-lg px-3.5 py-2.5 pr-9 shadow-inner focus:outline-none text-left cursor-pointer">
              <option value="todas">Categoría: Todas las Licencias</option>
              <option value="streaming">Streaming (Netflix, Max...)</option>
              <option value="office">Office & Windows</option>
              <option value="seguridad">Seguridad & Antivirus</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-amber-400 w-4 h-4 pointer-events-none" />
          </div>
          
          <div className="xl:col-span-3 relative">
            <select className="w-full appearance-none bg-slate-900/90 hover:bg-slate-900 text-slate-200 text-xs rounded-lg px-3.5 py-2.5 pr-9 shadow-inner focus:outline-none text-left cursor-pointer">
              <option value="todos">Canal: Todos los Canales</option>
              <option value="yappy">Yappy Comercial</option>
              <option value="bg">Banco General (ACH)</option>
              <option value="usdt">USDT Binance Pay</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-2.5 text-amber-400 w-4 h-4 pointer-events-none" />
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
              <span className="text-2xl text-white font-bold tracking-tight font-mono">{currentData.gross}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-emerald-400 text-xs">
            <span className="flex items-center font-bold">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4%
            </span>
            <span className="text-slate-400">vs. Sep 2026</span>
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
              <span className="text-2xl text-white font-bold tracking-tight font-mono">{currentData.net}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 font-mono font-bold text-[10px]">Margen: 63.5%</span>
            <span className="text-emerald-400 font-bold">+12.1% net</span>
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
              <span className="text-2xl text-white font-bold tracking-tight font-mono">{currentData.units}</span>
              <span className="text-xs text-slate-400">activas</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-cyan-300 text-xs">
            <span className="flex items-center font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> +52
            </span>
            <span className="text-slate-400">Obj: 600</span>
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
              <span className="text-2xl text-white font-bold tracking-tight font-mono">{currentData.cost}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-slate-400 text-xs">
            <span>36.5% de Ingreso</span>
            <span className="text-emerald-400 font-mono font-semibold text-[10px]">-3.2% opt.</span>
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
              <span className="text-2xl text-amber-300 font-bold tracking-tight font-mono">{currentData.ret}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-bold flex items-center">Renovaciones</span>
            <span className="text-slate-400">LTV: B/. 78.40</span>
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
              
              <text fill="#94a3b8" fontFamily="monospace" fontSize="10" textAnchor="end" x="32" y="34">B/. 16k</text>
              <text fill="#94a3b8" fontFamily="monospace" fontSize="10" textAnchor="end" x="32" y="89">B/. 12k</text>
              <text fill="#94a3b8" fontFamily="monospace" fontSize="10" textAnchor="end" x="32" y="144">B/. 8k</text>
              <text fill="#94a3b8" fontFamily="monospace" fontSize="10" textAnchor="end" x="32" y="199">B/. 4k</text>
              
              <rect className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer" onMouseEnter={(e) => handleBarHover(e, 'Sem 1 (1-7 Oct)', 'B/. 2,840.00', 'B/. 1,820.00')} onMouseLeave={handleBarLeave} fill="url(#amberBarGrad)" height="90" rx="4" width="28" x="75" y="110"></rect>
              <rect className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer" onMouseEnter={(e) => handleBarHover(e, 'Sem 2 (8-14 Oct)', 'B/. 3,690.00', 'B/. 2,340.00')} onMouseLeave={handleBarLeave} fill="url(#amberBarGrad)" height="115" rx="4" width="28" x="175" y="85"></rect>
              <rect className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer" onMouseEnter={(e) => handleBarHover(e, 'Sem 3 (15-21 Oct)', 'B/. 4,120.00', 'B/. 2,610.00')} onMouseLeave={handleBarLeave} fill="url(#amberBarGrad)" height="130" rx="4" width="28" x="275" y="70"></rect>
              <rect className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer" onMouseEnter={(e) => handleBarHover(e, 'Sem 4 (22-28 Oct)', 'B/. 4,820.00', 'B/. 3,080.00')} onMouseLeave={handleBarLeave} fill="url(#amberBarGrad)" height="145" rx="4" width="28" x="375" y="55"></rect>
              <rect className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer" onMouseEnter={(e) => handleBarHover(e, 'Cierre Oct (29-31)', 'B/. 2,940.00', 'B/. 1,860.00')} onMouseLeave={handleBarLeave} fill="url(#amberBarGrad)" height="110" rx="4" width="28" x="475" y="90"></rect>
              <rect className="cursor-pointer" onMouseEnter={(e) => handleBarHover(e, 'Proyección Nov', 'B/. 5,400.00 (Est.)', 'B/. 3,450.00')} onMouseLeave={handleBarLeave} fill="#f59e0b" fillOpacity="0.25" height="155" rx="4" stroke="#f59e0b" strokeDasharray="2 2" width="28" x="575" y="45"></rect>
              
              <path d="M 89 140 Q 189 110, 289 95 T 389 75 T 489 115 T 589 65 L 669 60 L 669 200 L 89 200 Z" fill="url(#emeraldArea)"></path>
              <path d="M 89 140 Q 189 110, 289 95 T 389 75 T 489 115 T 589 65 L 669 60" fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="3"></path>
              <path d="M 89 165 Q 189 155, 289 145 T 389 135 T 489 160 T 589 140 L 669 135" fill="none" stroke="#f43f5e" strokeDasharray="4 4" strokeWidth="2"></path>
              
              <circle cx="89" cy="140" fill="#059669" r="4.5" stroke="#fff" strokeWidth="1.5"></circle>
              <circle cx="189" cy="115" fill="#059669" r="4.5" stroke="#fff" strokeWidth="1.5"></circle>
              <circle cx="289" cy="95" fill="#059669" r="4.5" stroke="#fff" strokeWidth="1.5"></circle>
              <circle cx="389" cy="75" fill="#10b981" filter="url(#amberGlow)" r="5.5" stroke="#fef08a" strokeWidth="2"></circle>
              <circle cx="489" cy="115" fill="#059669" r="4.5" stroke="#fff" strokeWidth="1.5"></circle>
              <circle cx="589" cy="65" fill="#059669" r="4.5" stroke="#fff" strokeWidth="1.5"></circle>
              
              <text fill="#94a3b8" fontFamily="sans-serif" fontSize="10" textAnchor="middle" x="89" y="222">01-07 Oct</text>
              <text fill="#94a3b8" fontFamily="sans-serif" fontSize="10" textAnchor="middle" x="189" y="222">08-14 Oct</text>
              <text fill="#94a3b8" fontFamily="sans-serif" fontSize="10" textAnchor="middle" x="289" y="222">15-21 Oct</text>
              <text fill="#fbbf24" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle" x="389" y="222">22-28 (Pico)</text>
              <text fill="#94a3b8" fontFamily="sans-serif" fontSize="10" textAnchor="middle" x="489" y="222">29-31 Oct</text>
              <text fill="#64748b" fontFamily="sans-serif" fontSize="10" textAnchor="middle" x="589" y="222">Nov Proy</text>
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
              <InfoIcon className="w-3.5 h-3.5 text-amber-400" /> Pico semanal alcanzado en el Black Sale de Office 365
            </span>
            <span className="text-amber-400/90 font-mono font-semibold">Conversión: 24.8%</span>
          </div>
        </div>
        
        {/* Power BI Donut Ring Chart */}
        <div className="lg:col-span-4 bg-slate-950/80 backdrop-blur-md rounded-xl p-4 shadow-xl flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg text-white font-bold">Ingresos por Tipo</h3>
              <p className="text-sm text-slate-400">Participación en ventas</p>
            </div>
            <span className="px-2 py-1 rounded bg-slate-900 text-amber-300 font-mono text-xs font-semibold">B/. 14,820</span>
          </div>
          
          <div className="relative flex items-center justify-center my-3">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="38" stroke="#1e293b" strokeWidth="12"></circle>
              <circle className="hover:stroke-amber-300 transition-all cursor-pointer" cx="50" cy="50" fill="transparent" r="38" stroke="#f59e0b" strokeDasharray="100.28 238.76" strokeDashoffset="0" strokeWidth="12"></circle>
              <circle className="hover:stroke-cyan-300 transition-all cursor-pointer" cx="50" cy="50" fill="transparent" r="38" stroke="#06b6d4" strokeDasharray="85.95 238.76" strokeDashoffset="-100.28" strokeWidth="12"></circle>
              <circle className="hover:stroke-emerald-300 transition-all cursor-pointer" cx="50" cy="50" fill="transparent" r="38" stroke="#10b981" strokeDasharray="52.53 238.76" strokeDashoffset="-186.23" strokeWidth="12"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-slate-400 uppercase tracking-widest text-[10px]">Líder</span>
              <span className="text-2xl font-extrabold text-white leading-none mt-0.5">42%</span>
              <span className="text-amber-400 font-semibold text-[11px] mt-1">Office & Win</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                <span className="text-sm text-slate-200">Office & Windows</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-white font-bold">B/. 6,224.40</span>
                <span className="text-amber-400 font-mono text-xs ml-1.5 font-bold">42%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                <span className="text-sm text-slate-200">Streaming Premium</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-white font-bold">B/. 5,335.20</span>
                <span className="text-cyan-400 font-mono text-xs ml-1.5 font-bold">36%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                <span className="text-sm text-slate-200">Ciberseguridad</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-white font-bold">B/. 3,260.40</span>
                <span className="text-emerald-400 font-mono text-xs ml-1.5 font-bold">22%</span>
              </div>
            </div>
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
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Cumplimiento: 107.2%
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
              <tr className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Office 365 (Familiar)
                </td>
                <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-xs font-semibold">Yappy (68%)</span></td>
                <td className="py-3.5 px-4 text-right font-mono text-white font-bold">B/. 4,600.00</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">B/. 2,944.00</td>
                <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-emerald-300">64.0%</td>
                <td className="py-3.5 px-4 text-center"><span className="px-2 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-[11px] font-bold">Superado</span></td>
              </tr>
              <tr className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Streaming (Netflix/Disney)
                </td>
                <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-xs font-semibold">Banco Gen (52%)</span></td>
                <td className="py-3.5 px-4 text-right font-mono text-white font-bold">B/. 2,936.00</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">B/. 1,820.32</td>
                <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-emerald-300">62.0%</td>
                <td className="py-3.5 px-4 text-center"><span className="px-2 py-1 rounded-full bg-amber-950/60 text-amber-300 text-[11px] font-bold">En Meta</span></td>
              </tr>
              <tr className="hover:bg-slate-900/50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Windows 11 Pro OEM
                </td>
                <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 text-xs font-semibold">USDT Binance</span></td>
                <td className="py-3.5 px-4 text-right font-mono text-white font-bold">B/. 1,624.40</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">B/. 1,169.57</td>
                <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-emerald-300">72.0%</td>
                <td className="py-3.5 px-4 text-center"><span className="px-2 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-[11px] font-bold">Excelente</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
