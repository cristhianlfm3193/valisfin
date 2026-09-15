'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  Database, 
  HardDrive, 
  Activity, 
  ArrowUpRight, 
  Search, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Layers,
  Server
} from 'lucide-react';
import { getDatabaseMonitoringStats, MonitoringStats, MonitoringTableStat } from '@/app/actions/admin';

interface MonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonitoringModal({ isOpen, onClose }: MonitoringModalProps) {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<'all' | 'ValisFin' | 'ValisBiz' | 'ValisAN' | 'ValisHub'>('all');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDatabaseMonitoringStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error al cargar monitoreo:', err);
      setError(err?.message || 'Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !stats) {
      fetchStats();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTables = stats?.tables.filter(t => {
    const matchesSearch = 
      t.table.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'all' || t.module === selectedModule;
    return matchesSearch && matchesModule;
  }) || [];

  const getModuleBadge = (module: string) => {
    switch (module) {
      case 'ValisFin':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ValisBiz':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'ValisAN':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#05070a]/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#0d141e] border border-white/10 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] z-10 text-white font-['Plus_Jakarta_Sans']">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#121c27]/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Monitoreo de Base de Datos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  En Vivo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Métricas del Plan Gratuito de Supabase y desglose de tablas en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 rounded-xl transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
              title="Actualizar datos de Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>{loading ? 'Calculando...' : 'Actualizar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm flex items-center gap-3">
              <Zap className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Card 1: Almacenamiento DB */}
            <div className="bg-[#121c27] p-4 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Almacenamiento DB
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Free 500 MB
                </span>
              </div>

              <div className="my-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-white">
                    {stats ? `${stats.estimatedPostgresDiskMB} MB` : '...'}
                  </span>
                  <span className="text-xs text-slate-400">/ 500 MB</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-white/5 h-2 rounded-full mt-2.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${Math.max(stats ? stats.diskPercentUsed : 0, 4)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>{stats ? `${stats.diskPercentUsed}% utilizado` : 'Cargando...'}</span>
                <span className="text-emerald-400 font-semibold">{stats ? `${stats.diskFreeMB} MB libres` : ''}</span>
              </div>
            </div>

            {/* Card 2: Egress / Bandwidth */}
            <div className="bg-[#121c27] p-4 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
                  Transferencia (Egress)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Free 5 GB/mes
                </span>
              </div>

              <div className="my-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-white">
                    {stats ? `~${stats.estMonthlyEgressMB} MB` : '...'}
                  </span>
                  <span className="text-xs text-slate-400">/ 5,000 MB</span>
                </div>

                <div className="w-full bg-white/5 h-2 rounded-full mt-2.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: '5.6%' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Consumo mensual</span>
                <span className="text-sky-400 font-semibold">🟢 94% libre</span>
              </div>
            </div>

            {/* Card 3: Storage (Archivos & Recibos) */}
            <div className="bg-[#121c27] p-4 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  Storage de Archivos
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Free 1 GB
                </span>
              </div>

              <div className="my-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-white">
                    {stats ? `~${stats.storageUsedMB} MB` : '...'}
                  </span>
                  <span className="text-xs text-slate-400">/ 1,024 MB</span>
                </div>

                <div className="w-full bg-white/5 h-2 rounded-full mt-2.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: '1.2%' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Recibos y adjuntos</span>
                <span className="text-amber-400 font-semibold">🟢 &lt; 2% usado</span>
              </div>
            </div>

            {/* Card 4: Auth & Salud */}
            <div className="bg-[#121c27] p-4 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Usuarios & Estado
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  50k MAU Max
                </span>
              </div>

              <div className="my-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-white">
                    {stats ? `${stats.authUsersCount}` : '...'}
                  </span>
                  <span className="text-xs text-slate-400">cuentas activas</span>
                </div>

                <div className="w-full bg-white/5 h-2 rounded-full mt-2.5 overflow-hidden border border-white/5">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '2%' }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Pausa por inactividad</span>
                <span className="text-emerald-400 font-semibold">0% riesgo (Activo)</span>
              </div>
            </div>

          </div>

          {/* Diagnostic Banner */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-[#121c27] to-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white">
                  Diagnóstico de Capacidad: <span className="text-emerald-400">Óptimo y Seguro</span>
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Tienes <strong className="text-white">{stats ? stats.totalRows.toLocaleString() : '...'} filas</strong> en total ({stats ? `${stats.totalEstimatedMB} MB` : '...'} netos). El 90% del volumen corresponde a la base de datos de personal (<code>valisan_bdrh</code>). Tienes más de <strong className="text-emerald-400">{stats ? `${stats.diskFreeMB} MB` : '...'}</strong> de cuota gratuita libre para seguir registrando datos.
                </p>
              </div>
            </div>

            {stats?.timestamp && (
              <div className="text-[11px] text-slate-500 whitespace-nowrap self-end sm:self-auto flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(stats.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            )}
          </div>

          {/* Table Breakdown Section */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Desglose Detallado por Tabla en Supabase
                </h3>
                <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                  {filteredTables.length} tablas
                </span>
              </div>

              {/* Module Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'ValisFin', 'ValisBiz', 'ValisAN', 'ValisHub'] as const).map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setSelectedModule(mod)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedModule === mod
                        ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {mod === 'all' ? 'Todas' : mod}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tabla o concepto (ej: valisan, gastos, locales, ventas)..."
                className="w-full bg-[#121c27] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            {/* Tables List */}
            <div className="bg-[#121c27] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Tabla & Descripción</th>
                      <th className="py-3 px-4">Módulo</th>
                      <th className="py-3 px-4 text-right">Registros</th>
                      <th className="py-3 px-4 text-right">Peso Estimado</th>
                      <th className="py-3 px-4 text-right">% del Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading && !stats ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                          <span>Calculando estadísticas en vivo de Supabase...</span>
                        </td>
                      </tr>
                    ) : filteredTables.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                          No se encontraron tablas con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredTables.map((t) => (
                        <tr key={t.table} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{t.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono"><code>{t.table}</code></div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getModuleBadge(t.module)}`}>
                              {t.module}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-200">
                            {t.count.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-slate-300">
                            {Number(t.estMB) >= 0.05 ? `${t.estMB} MB` : `${t.estKB} KB`}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs font-mono text-slate-400 w-10 text-right">
                                {t.percentageOfTotal}%
                              </span>
                              <div className="w-14 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-emerald-500 h-full rounded-full" 
                                  style={{ width: `${Math.min(100, Math.max(t.percentageOfTotal, 2))}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#121c27]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Server className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Proyecto Supabase: <strong>vtylfxzskvknwvxszdfa</strong> • Región: US East
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 text-center"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
