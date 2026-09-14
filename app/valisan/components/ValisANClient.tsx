'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LoadingCube } from '@/app/components/LoadingCube';
import { BarChart2, Target, Shield, Search, Calendar as CalendarIcon, FileDown, PlusCircle, SlidersHorizontal, CheckCircle2, AlertTriangle, Eye, ShieldCheck, MapPin, Download, Edit2, Trash2, Loader2, ArrowUpDown, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { format, subDays, subMonths, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import ReporteOperativoModal from './ReporteOperativoModal';
import ValisAIAssistant from './ValisAIAssistant';
import ReporteDetalleModal from './ReporteDetalleModal';
import BDRHModal from './BDRHModal';

const JURAMENTADOS_RANKS = [
  "Director General",
  "Subdirector General",
  "Comisionado",
  "Subcomisionado",
  "Mayor",
  "Capitán",
  "Teniente",
  "Subteniente",
  "Sargento 1ro.",
  "Sargento 2do.",
  "Cabo 1ro.",
  "Cabo 2do.",
  "Guardia"
];

function normalizeRank(rawRank: string | null | undefined): string {
  if (!rawRank) return "No juramentado";
  
  const normalized = rawRank.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const cleanStr = normalized.replace(/[^a-z0-9]/g, "");
  
  if (cleanStr === "directorgeneral" || cleanStr === "director") return "Director General";
  if (cleanStr === "subdirectorgeneral" || cleanStr === "subdirector") return "Subdirector General";
  if (cleanStr === "comisionado") return "Comisionado";
  if (cleanStr === "subcomisionado") return "Subcomisionado";
  if (cleanStr === "mayor") return "Mayor";
  if (cleanStr === "capitan" || cleanStr === "capitn") return "Capitán";
  if (cleanStr === "teniente") return "Teniente";
  if (cleanStr === "subteniente") return "Subteniente";
  if (cleanStr === "sargento1ro") return "Sargento 1ro.";
  if (cleanStr === "sargento2do") return "Sargento 2do.";
  if (cleanStr === "cabo1ro") return "Cabo 1ro.";
  if (cleanStr === "cabo2do") return "Cabo 2do.";
  if (cleanStr === "guardia") return "Guardia";
  
  return "No juramentado";
}

const rankOrder = (rank: string) => {
  const idx = JURAMENTADOS_RANKS.indexOf(normalizeRank(rank));
  return idx !== -1 ? idx : 999;
};

interface ValisANClientProps {
  user: { name: string; initial: string };
  activeTab: string;
}

export default function ValisANClient({ user, activeTab }: ValisANClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const getTabName = () => {
    if (activeTab === 'dashboard') return 'Dashboard';
    if (activeTab === 'aipp') return 'AIPP (Reportes)';
    if (activeTab === 'bdrh') return 'BD-RH (Personal)';
    return 'ValisAN';
  };

  const [isGlobalReporteModalOpen, setIsGlobalReporteModalOpen] = useState(false);
  const [globalAiData, setGlobalAiData] = useState<any>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  return (
    <div className="w-full max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-32">
      {/* Ambient Top Cyan Beam */}
      <div className="fixed top-0 left-1/3 -translate-x-1/2 w-[700px] h-[320px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      
      {/* Global NavigationLoader handles tab transitions now */}

      {/* Global Header & Search Toolbar */}
      <header className="bg-[#0a1426]/68 backdrop-blur-xl shadow-[0_0_25px_-5px_rgba(14,165,233,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-sky-500/25 z-10">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          
          {/* Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-semibold uppercase tracking-wider">
                Base de Datos
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <RefreshCwIcon className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> Supabase Sync Activo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Valis<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">AN</span> • III Capitán Cristhian Fuentes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-medium tracking-wide">
              Servicio Nacional Aeronaval - Dios Patría y Honor.
            </p>
          </div>
        </div>
      </header>

      {/* Tab Content Rendering */}
      {activeTab === 'dashboard' && <ValisANDashboard />}
      {activeTab === 'aipp' && <ValisANAIPP setGlobalAiData={setGlobalAiData} setIsGlobalReporteModalOpen={setIsGlobalReporteModalOpen} refreshCounter={refreshCounter} />}
      {activeTab === 'bdrh' && <ValisANBDRH />}

      {/* Asistente AI y Modal Globales para que funcionen en todas las pestañas */}
      <ReporteOperativoModal 
        isOpen={isGlobalReporteModalOpen} 
        onClose={() => {
          setIsGlobalReporteModalOpen(false);
          setGlobalAiData(null); // Limpiar datos de IA al cerrar
        }}
        onSuccess={() => setRefreshCounter(c => c + 1)}
        initialData={globalAiData}
      />
      
      <ValisAIAssistant 
        onDataParsed={(data) => {
          setGlobalAiData(data);
          setIsGlobalReporteModalOpen(true);
        }} 
      />

      {/* Institutional Footer */}
      <footer className="pt-6 pb-12 border-t border-slate-800 text-center space-y-2 text-xs text-slate-400">
        <p className="font-medium">
          ValisAN v3.0 • Ecosistema Unificado de Inteligencia, BI &amp; Analítica Institucional
        </p>
        <p className="text-[11px] text-slate-500">
          Supervisión Activa: Jennifer Camaño • Inteligencia y Sistemas: Cristhian Fuentes • © 2026 Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

// Sub-components for Tabs to keep it organized
function ValisANDashboard() {
  const supabase = createClient();
  const [reportes, setReportes] = useState<any[]>([]);
  const [bdrhCount, setBdrhCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_month' | 'exact_date'>('this_month');
  const [exactDate, setExactDate] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch reportes
      const { data: reportesData } = await supabase
        .from('reportes')
        .select('fecha, departamento');
      
      if (reportesData) {
        setReportes(reportesData);
      }

      // Fetch BDRH count
      const { count } = await supabase
        .from('valisan_bdrh')
        .select('*', { count: 'exact', head: true });
        
      if (count !== null) {
        setBdrhCount(count);
      }

      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const filteredReportes = useMemo(() => {
    if (!reportes.length) return [];
    
    const now = new Date();
    return reportes.filter(r => {
      if (!r.fecha) return false;
      const date = parseISO(r.fecha);
      if (dateFilter === 'all') return true;
      if (dateFilter === 'exact_date') {
        if (!exactDate) return true;
        return r.fecha === exactDate;
      }
      if (dateFilter === 'this_month') {
        return isAfter(date, subDays(now, 30));
      }
      if (dateFilter === 'last_month') {
         // approx last month
         return isAfter(date, subDays(now, 60)) && !isAfter(date, subDays(now, 30));
      }
      return true;
    });
  }, [reportes, dateFilter, exactDate]);

  const reportesPorDia = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReportes.forEach(r => {
      if (!r.fecha) return;
      const dateStr = format(parseISO(r.fecha), 'MMM dd', { locale: es });
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });
    return Object.entries(counts).map(([name, Recorridos]) => ({ name, Recorridos }));
  }, [filteredReportes]);

  const reportesPorDepartamento = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReportes.forEach(r => {
      const dep = r.departamento || 'Sin Asignar';
      counts[dep] = (counts[dep] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, Total]) => ({ name, Total }))
      .sort((a, b) => b.Total - a.Total)
      .slice(0, 10);
  }, [filteredReportes]);

  return (
    <section className="space-y-6 animate-in fade-in zoom-in-95 duration-300 z-10 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] animate-pulse"></span>
          <h2 className="text-xl font-bold tracking-tight text-white">Dashboard ValisAN</h2>
        </div>
        
        {/* Filtro de Fecha */}
        <div className="flex items-center gap-2 bg-[#0a1426]/80 p-1.5 rounded-xl border border-sky-500/30 shadow-inner flex-wrap">
          <input 
            type="date"
            value={exactDate}
            onChange={(e) => {
              setExactDate(e.target.value);
              if (e.target.value) {
                setDateFilter('exact_date');
              }
            }}
            className={`px-3 py-1.5 h-[32px] rounded-lg text-xs font-semibold bg-slate-900 border ${dateFilter === 'exact_date' ? 'border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border-slate-700 text-slate-400'} focus:outline-none focus:border-cyan-400 transition cursor-pointer [color-scheme:dark]`}
          />
          <div className="w-px h-5 bg-slate-700/50 mx-1"></div>
          <button 
            onClick={() => setDateFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${dateFilter === 'all' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Histórico
          </button>
          <button 
            onClick={() => setDateFilter('last_month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${dateFilter === 'last_month' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Mes Pasado
          </button>
          <button 
            onClick={() => setDateFilter('this_month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${dateFilter === 'this_month' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            Últimos 30 días
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* KPI 1: Reportes Operativos */}
        <div className="bg-[#0a1426]/68 backdrop-blur-xl border border-sky-500/20 p-6 rounded-2xl border-l-4 border-l-cyan-400 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> Registros Reporte Operativo
              </p>
              {loading ? (
                <div className="h-10 w-24 bg-slate-800 animate-pulse rounded mt-2"></div>
              ) : (
                <p className="text-4xl sm:text-5xl font-black text-white mt-2 tracking-tighter">
                  {filteredReportes.length.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full w-full"></div>
          </div>
        </div>

        {/* KPI 2: BD-RH */}
        <div className="bg-[#0a1426]/68 backdrop-blur-xl border border-indigo-500/20 p-6 rounded-2xl border-l-4 border-l-indigo-400 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" /> Registros BD-RH
              </p>
              {loading ? (
                 <div className="h-10 w-24 bg-slate-800 animate-pulse rounded mt-2"></div>
              ) : (
                <p className="text-4xl sm:text-5xl font-black text-white mt-2 tracking-tighter">
                  {bdrhCount.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-6 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-400 h-full rounded-full w-full"></div>
          </div>
        </div>
      </div>
      
      {/* Visualizations Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recorridos por Día (Area Chart) */}
        <div className="bg-[#0a1426]/68 backdrop-blur-xl border border-sky-500/20 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Recorridos por Día</h3>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : reportesPorDia.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportesPorDia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRecorridos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '0.75rem', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Area type="monotone" dataKey="Recorridos" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRecorridos)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No hay datos para el periodo seleccionado</div>
            )}
          </div>
        </div>

        {/* Reportes por Departamento (Bar Chart) */}
        <div className="bg-[#0a1426]/68 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">Top Departamentos Activos</h3>
          </div>
          <div className="h-72 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : reportesPorDepartamento.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportesPorDepartamento} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#818cf8', borderRadius: '0.75rem', color: '#f8fafc' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="Total" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {reportesPorDepartamento.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#4f46e5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No hay datos para el periodo seleccionado</div>
            )}
          </div>
        </div>
        
      </div>
    </section>
  );
}

function ValisANAIPP({ setGlobalAiData, setIsGlobalReporteModalOpen, refreshCounter }: { setGlobalAiData: any, setIsGlobalReporteModalOpen: any, refreshCounter: number }) {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [searchReportes, setSearchReportes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllReportes, setShowAllReportes] = useState(false);
  
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  
  const supabase = createClient();

  const fetchReportes = async () => {
    setLoadingReportes(true);
    const { data, error } = await supabase
      .from('reportes')
      .select('*, reporte_unidades(*), reporte_vehiculos(*)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setReportes(data);
    }
    setLoadingReportes(false);
  };

  useEffect(() => {
    fetchReportes();
  }, [supabase, refreshCounter]);

  const filteredReportes = useMemo(() => {
    let result = reportes;

    if (searchReportes) {
      const term = searchReportes.toLowerCase();
      result = reportes.filter(rep => {
        const matchBasico = 
          (rep.departamento && rep.departamento.toLowerCase().includes(term)) ||
          (rep.asunto && rep.asunto.toLowerCase().includes(term)) ||
          (rep.reporta_nombre && rep.reporta_nombre.toLowerCase().includes(term)) ||
          (rep.reporta_rango && rep.reporta_rango.toLowerCase().includes(term)) ||
          (rep.fecha && rep.fecha.includes(term)) ||
          (rep.narrativa && rep.narrativa.toLowerCase().includes(term));
          
        return matchBasico;
      });
    }

    return [...result].sort((a: any, b: any) => {
      const dateA = new Date(`${a.fecha || '1970-01-01'}T${a.hora || '00:00'}`);
      const dateB = new Date(`${b.fecha || '1970-01-01'}T${b.hora || '00:00'}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [reportes, searchReportes]);

  const itemsPerPage = showAllReportes ? (filteredReportes?.length || 1) : 20;
  const totalPages = Math.max(1, Math.ceil(filteredReportes.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReportes = filteredReportes.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchReportes]);

  const handleDeleteReporte = async (id: string) => {
    if (window.confirm('¿Está seguro que desea eliminar este reporte? Esta acción no se puede deshacer.')) {
      setLoadingReportes(true);
      const { error } = await supabase.from('reportes').delete().eq('id', id);
      if (error) {
        console.error("Error eliminando reporte:", error);
        alert("Ocurrió un error al intentar eliminar el reporte.");
      } else {
        await fetchReportes();
      }
      setLoadingReportes(false);
    }
  };

  const handleEditReporte = (rep: any) => {
    const mappedData = {
      id: rep.id,
      departamento: rep.departamento,
      asunto: rep.asunto,
      fecha: rep.fecha,
      hora: rep.hora,
      narrativa: rep.narrativa,
      areas_recorrido: rep.areas_recorrido,
      equipos_novedad: rep.equipos_novedad,
      reporta: {
        rango: rep.reporta_rango,
        placa: rep.reporta_placa,
        nombre: rep.reporta_nombre
      },
      informa: {
        rango: rep.informa_rango,
        placa: rep.informa_placa,
        nombre: rep.informa_nombre
      },
      unidades: rep.reporte_unidades || [],
      vehiculos: rep.reporte_vehiculos || []
    };
    setGlobalAiData(mappedData);
    setIsGlobalReporteModalOpen(true);
  };

  return (
    <section className="space-y-10 animate-in fade-in zoom-in-95 duration-300 z-10 relative">
      
      {/* SECCIÓN ÚNICA: REPORTES OPERATIVOS */}
      <div className="space-y-5">
        <div className="bg-[#0a1426]/68 backdrop-blur-xl rounded-3xl border border-sky-500/20 overflow-hidden shadow-2xl">
          
          {/* Header de la Tabla Integrado */}
          <div className="p-4 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/30">
            <h2 className="text-xl font-bold text-white tracking-tight">Reportes Operativos</h2>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Buscador Integrado */}
              <div className="relative w-full sm:w-80 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                <input 
                  type="text" 
                  placeholder="Buscar en detalle operativo, asunto, placa..." 
                  value={searchReportes}
                  onChange={(e) => setSearchReportes(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
              
              <button 
                onClick={() => setIsGlobalReporteModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4" />
                Registrar Reporte
              </button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[250px]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Fecha / Hora</th>
                  <th className="py-3.5 px-4">Departamento</th>
                  <th className="py-3.5 px-4">Tipo de Reporte</th>
                  <th className="py-3.5 px-4">Reporta</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 relative">
                {loadingReportes ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                        <p className="text-slate-400 font-medium">Cargando reportes...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedReportes.length > 0 ? (
                  paginatedReportes.map((rep: any) => (
                    <tr key={rep.id} className="hover:bg-sky-950/30 transition group">
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {rep.fecha} <span className="text-slate-500 ml-1">{rep.hora.substring(0,5)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {rep.departamento}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">{rep.asunto}</td>
                      <td className="py-3 px-4 text-slate-300">{rep.reporta_rango} {rep.reporta_nombre}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setViewingReport(rep);
                              setIsDetalleModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-900 hover:text-sky-300 text-slate-400 transition" 
                            title="Ver Detalles Completos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditReporte(rep)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-900/50 hover:text-amber-300 text-slate-400 transition" 
                            title="Editar Reporte"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteReporte(rep.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 transition" 
                            title="Eliminar Reporte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      {searchReportes ? 'No se encontraron reportes que coincidan con tu búsqueda.' : 'No hay reportes registrados aún.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Paginación */}
        {filteredReportes.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Mostrando <span className="font-semibold text-white">{Math.min(startIndex + 1, filteredReportes.length)}</span> a <span className="font-semibold text-white">{Math.min(startIndex + itemsPerPage, filteredReportes.length)}</span> de <span className="font-semibold text-cyan-400">{filteredReportes.length}</span> reportes
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  currentPage === 1 
                    ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Anterior
              </button>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs text-slate-400 font-medium px-2">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  currentPage === totalPages 
                    ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Siguiente
              </button>
              <div className="w-px h-6 bg-slate-700 mx-2 hidden sm:block"></div>
              <button 
                onClick={() => {
                  setShowAllReportes(!showAllReportes);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border hidden sm:block ${
                  showAllReportes 
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {showAllReportes ? 'Ver Paginado' : 'Ver Todos'}
              </button>
            </div>
          </div>
        )}
      </div>

      <ReporteDetalleModal 
        isOpen={isDetalleModalOpen}
        onClose={() => {
          setIsDetalleModalOpen(false);
          setViewingReport(null);
        }}
        reporte={viewingReport}
      />

    </section>
  );
}

function ValisANBDRH() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const supabase = createClient();

  const [selectedBdrhPerson, setSelectedBdrhPerson] = useState<any>(null);
  const [isBdrhModalOpen, setIsBdrhModalOpen] = useState(false);
  const [bdrhModalMode, setBdrhModalMode] = useState<'view' | 'edit'>('view');

  const handleViewPerson = (person: any) => {
    setSelectedBdrhPerson(person);
    setBdrhModalMode('view');
    setIsBdrhModalOpen(true);
  };

  const handleEditPerson = (person: any) => {
    setSelectedBdrhPerson(person);
    setBdrhModalMode('edit');
    setIsBdrhModalOpen(true);
  };

  const handleSavePerson = async (updatedPerson: any) => {
    const { id, ...updateData } = updatedPerson;
    // Don't update the rank normalization field we added client side if it doesn't match db structure
    // actually, we overwrite rango directly, which is fine since the DB has 'rango' column.
    
    const { error } = await supabase
      .from('valisan_bdrh')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating person:", error);
      alert("Hubo un error al guardar los cambios.");
      return;
    }

    setData(prevData => prevData.map(p => p.id === id ? updatedPerson : p));
  };

  const handleDeletePerson = async (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.")) {
      const { error } = await supabase
        .from('valisan_bdrh')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting person:", error);
        alert("Hubo un error al eliminar el registro.");
        return;
      }
      
      setData(prevData => prevData.filter(p => p.id !== id));
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let allData: any[] = [];
      let page = 0;
      let hasMore = true;
      const pageSize = 1000;

      while (hasMore) {
        const { data: bdrhData, error } = await supabase
          .from('valisan_bdrh')
          .select('*')
          .order('id', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);
          
        if (error) {
          console.error("Error fetching data:", error);
          break;
        }

        if (bdrhData && bdrhData.length > 0) {
          const normalizedData = bdrhData.map((row: any) => ({
            ...row,
            rango: normalizeRank(row.rango)
          }));
          allData = [...allData, ...normalizedData];
          page++;
          if (bdrhData.length < pageSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      
      setData(allData);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  // Calculate rank counts for filter buttons
  const rankCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(row => {
      // Clean up periods if any to match standard, but assuming DB matches requested strings
      const rank = row.rango || 'Sin Rango';
      counts[rank] = (counts[rank] || 0) + 1;
    });

    const rankOrder = [
      "Director General",
      "Subdirector General",
      "Comisionado",
      "Subcomisionado",
      "Mayor",
      "Capitán",
      "Teniente",
      "Subteniente",
      "Sargento 1ro.",
      "Sargento 2do.",
      "Cabo 1ro.",
      "Cabo 2do.",
      "Guardia",
      "No juramentado"
    ];

    // Find any ranks in the data that aren't in the explicit order
    const otherRanks = Object.keys(counts).filter(r => !rankOrder.includes(r));

    const finalOrder = [...rankOrder, ...otherRanks];

    return finalOrder.map(rank => ({
      rank,
      count: counts[rank] || 0
    })); // Always show all explicitly requested ranks
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = data;

    if (selectedRanks.length > 0) {
      result = result.filter(row => selectedRanks.includes(row.rango || 'No juramentado'));
    }

    if (searchTerm) {
      const normalizeString = (str: string) => {
        if (!str) return '';
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      };
      
      const normalizedSearch = normalizeString(searchTerm);
      
      result = result.filter(row => 
        normalizeString(row.nombre_completo).includes(normalizedSearch) ||
        normalizeString(row.cedula).includes(normalizedSearch) ||
        normalizeString(row.rango).includes(normalizedSearch) ||
        normalizeString(row.pos_id).includes(normalizedSearch) ||
        normalizeString(row.direccion).includes(normalizedSearch) ||
        normalizeString(row.grupo_pd).includes(normalizedSearch) ||
        normalizeString(row.departamento).includes(normalizedSearch)
      );
    }

    if (sortConfig !== null) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        
        if (sortConfig.key === 'id' || sortConfig.key === 'pos_id') {
          const numA = Number(aVal);
          const numB = Number(bVal);
          if (!isNaN(numA) && !isNaN(numB)) {
             return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
          }
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, selectedRanks, data, sortConfig]);

  const toggleRank = (rank: string) => {
    setSelectedRanks(prev => 
      prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
    );
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 inline text-slate-400" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-3 h-3 ml-1 inline text-cyan-400" />
      : <ChevronDown className="w-3 h-3 ml-1 inline text-cyan-400" />;
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search or sort or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRanks, sortConfig, itemsPerPage]);

  return (
    <section className="space-y-5 animate-in fade-in zoom-in-95 duration-300 z-10 relative">

      {/* Rank Filter Buttons */}
      {!loading && data.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <button 
            onClick={() => setSelectedRanks([])}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              selectedRanks.length === 0 
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            Todos
            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] ${selectedRanks.length === 0 ? 'bg-slate-950/20' : 'bg-slate-900 text-slate-400'}`}>
              {data.length}
            </span>
          </button>
          {rankCounts.map((rank) => (
            <button 
              key={rank.rank}
              onClick={() => toggleRank(rank.rank)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                selectedRanks.includes(rank.rank) 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {rank.rank}
              <span className={`px-1.5 py-0.5 rounded-lg text-[10px] ${selectedRanks.includes(rank.rank) ? 'bg-slate-950/20' : 'bg-slate-900 text-slate-400'}`}>
                {rank.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search Bar and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative w-full lg:max-w-md shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
          <input 
            type="text" 
            placeholder="Buscar por cédula, nombre, rango, unidad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a1426]/80 border border-sky-500/30 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition shadow-inner"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <select 
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-4 py-3 sm:py-2.5 text-sm focus:outline-none focus:border-sky-500 transition cursor-pointer"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={10}>Mostrar 10</option>
            <option value={50}>Mostrar 50</option>
            <option value={100}>Mostrar 100</option>
            <option value={10000}>Mostrar todos</option>
          </select>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedRanks([]);
              setSortConfig(null);
            }}
            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm transition"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="bg-[#0a1426]/68 backdrop-blur-xl rounded-3xl border border-sky-500/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-12 text-center cursor-pointer hover:text-white transition group" onClick={() => handleSort('id')}>
                  # <SortIcon columnKey="id" />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white transition group" onClick={() => handleSort('rango')}>
                  Rango <SortIcon columnKey="rango" />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white transition group" onClick={() => handleSort('pos_id')}>
                  Posición <SortIcon columnKey="pos_id" />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white transition group" onClick={() => handleSort('nombre_completo')}>
                  Apellido / Nombre <SortIcon columnKey="nombre_completo" />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white transition group" onClick={() => handleSort('cedula')}>
                  Cédula <SortIcon columnKey="cedula" />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white transition group" onClick={() => handleSort('direccion')}>
                  Dirección <SortIcon columnKey="direccion" />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white transition group" onClick={() => handleSort('grupo_pd')}>
                  Grupo PD <SortIcon columnKey="grupo_pd" />
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white transition group" onClick={() => handleSort('departamento')}>
                  Departamento <SortIcon columnKey="departamento" />
                </th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 relative">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                      <p className="text-slate-400 font-medium">Cargando base de datos BD-RH...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-sky-950/30 transition group">
                  <td className="py-3 px-4 text-center text-slate-500 font-medium">{row.id}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {row.rango}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-400 font-medium">{row.pos_id}</td>
                  <td className="py-3 px-4 font-bold text-white">{row.nombre_completo}</td>
                  <td className="py-3 px-4 text-slate-300">{row.cedula}</td>
                  <td className="py-3 px-4 text-slate-300">{row.direccion}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/80 text-sky-300 border border-sky-500/40">
                      {row.grupo_pd}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 truncate max-w-[150px]" title={row.departamento}>{row.departamento}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleViewPerson(row)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900 hover:text-emerald-300 text-slate-400 transition" title="Ver Info">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditPerson(row)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-900 hover:text-sky-300 text-slate-400 transition" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePerson(row.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 hover:text-rose-300 text-slate-400 transition" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            Mostrando <span className="font-semibold text-white">{Math.min(startIndex + 1, filteredData.length)}</span> a <span className="font-semibold text-white">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> de <span className="font-semibold text-cyan-400">{filteredData.length}</span> registros
          </p>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                currentPage === 1 
                  ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              Anterior
            </button>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-xs text-slate-400 font-medium px-2">
                Página {currentPage} de {totalPages}
              </span>
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                currentPage === totalPages 
                  ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <BDRHModal 
        isOpen={isBdrhModalOpen}
        onClose={() => setIsBdrhModalOpen(false)}
        person={selectedBdrhPerson}
        mode={bdrhModalMode}
        onSave={handleSavePerson}
      />
    </section>
  );
}

// Icons
function RefreshCwIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
  );
}
function TrendingUpIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  );
}
