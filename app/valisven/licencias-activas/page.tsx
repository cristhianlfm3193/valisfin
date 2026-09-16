'use client';

import { useState } from 'react';
import { 
  Upload, UserPlus, MonitorSmartphone, Key, AlertTriangle, RefreshCw, 
  Search, X, Copy, MessageCircle, Eye, RefreshCcw, CheckCircle, 
  Grid, Shield, PlayCircle, Laptop, Smartphone, TrendingUp
} from 'lucide-react';

export default function LicenciasActivasPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [assignProduct, setAssignProduct] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // would show a toast here
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header Area */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-900/40 shadow-xl p-6 mb-8 border border-white/5">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs uppercase tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                Cripto-Bóveda & Telemetría
              </span>
              <span className="font-mono text-slate-500 text-xs">VALIS-KEY-SYS // NODO-04</span>
            </div>
            <h1 className="text-2xl sm:text-3xl text-white font-bold tracking-tight">Gestión de Licencias Activas & Bóveda</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">Monitoreo táctico de claves criptográficas, vencimientos inminentes y provisión de credenciales seguras a clientes de la red ValisVen.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 text-sm font-semibold shadow-md transition-all"
              onClick={() => setBatchModalOpen(true)}
            >
              <Upload className="w-5 h-5 text-amber-400" />
              <span>Cargar Lote de Claves</span>
            </button>
            <button 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all"
              onClick={() => setAssignModalOpen(true)}
            >
              <UserPlus className="w-5 h-5" />
              <span>Asignar Licencia a Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {/* KPI 1 */}
        <div className="relative overflow-hidden rounded-xl bg-slate-950/70 shadow-lg p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Licencias Activas</span>
              <span className="text-3xl font-mono text-white font-bold mt-1">284</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shadow-inner">
              <MonitorSmartphone className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 font-mono text-emerald-400 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> +14% mes
            </span>
            <span className="text-xs text-slate-400">En uso en 189 clientes</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full w-[74%]"></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="relative overflow-hidden rounded-xl bg-slate-950/70 shadow-lg p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Stock en Bóveda</span>
              <span className="text-3xl font-mono text-white font-bold mt-1">96</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shadow-inner">
              <Key className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-amber-300 text-xs font-bold">Listas para asignación</span>
            <span className="text-xs text-slate-400">4 categorías</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full w-[48%]"></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="relative overflow-hidden rounded-xl bg-slate-950/70 shadow-lg p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Vence &lt; 7 Días</span>
              <span className="text-3xl font-mono text-amber-300 font-bold mt-1">18</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shadow-inner animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-rose-300 text-xs font-bold">Alerta de Renovación</span>
            <span className="text-xs text-slate-400">12 vía WhatsApp</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full w-[82%]"></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="relative overflow-hidden rounded-xl bg-slate-950/70 shadow-lg p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Tasa de Renovación</span>
              <span className="text-3xl font-mono text-white font-bold mt-1">94.2%</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 font-mono text-emerald-400 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> +2.8% vs 2025
            </span>
            <span className="text-xs text-slate-400">Retención VIP</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[94%]"></div>
          </div>
        </div>
      </section>

      {/* Bóveda Rápida */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArchiveIcon className="text-amber-400 w-5 h-5" />
            <h2 className="text-lg text-white font-bold">Bóveda Rápida de Inventario Disponible</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">96 Keys Libres</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Actualización en tiempo real</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-slate-950/70 p-4 shadow-md flex flex-col justify-between hover:bg-slate-900/80 transition-all border border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white font-semibold leading-none">Office 2024 Pro</p>
                  <span className="text-xs text-slate-400">Microsoft Perpetual</span>
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-amber-300">12</span>
            </div>
          </div>
          
          <div className="rounded-xl bg-slate-950/70 p-4 shadow-md flex flex-col justify-between hover:bg-slate-900/80 transition-all border border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white font-semibold leading-none">ESET NOD32 2026</p>
                  <span className="text-xs text-slate-400">Antivirus 1 PC / 1 Año</span>
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-amber-300">25</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/70 p-4 shadow-md flex flex-col justify-between hover:bg-slate-900/80 transition-all border border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white font-semibold leading-none">Max HBO 4K</p>
                  <span className="text-xs text-slate-400">Perfiles con PIN Ultra</span>
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-amber-300">08</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/70 p-4 shadow-md flex flex-col justify-between hover:bg-slate-900/80 transition-all border border-white/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white font-semibold leading-none">Windows 11 Pro</p>
                  <span className="text-xs text-slate-400">Retail OEM Digital</span>
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-amber-300">15</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Table */}
      <section className="rounded-xl bg-slate-950/80 shadow-2xl p-4 sm:p-6 mb-8 border border-white/5">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
              <input 
                className="w-full bg-slate-900/90 text-white placeholder:text-slate-500 text-sm pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner" 
                placeholder="Buscar por Product Key, cliente, correo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
              />
              {searchQuery && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" onClick={() => setSearchQuery('')}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Estado:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-900/90">
                <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'all' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}>Todos</button>
                <button onClick={() => setFilterStatus('active')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'}`}>Activa</button>
                <button onClick={() => setFilterStatus('warning')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'warning' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}>Por Vencer</button>
                <button onClick={() => setFilterStatus('vault')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'vault' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'}`}>Bóveda</button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-2">Categoría:</span>
            <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterCategory === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:text-amber-300'}`}>Todas</button>
            <button onClick={() => setFilterCategory('streaming')} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterCategory === 'streaming' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:text-amber-300'}`}>Streaming</button>
            <button onClick={() => setFilterCategory('office')} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterCategory === 'office' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:text-amber-300'}`}>Office & Windows</button>
            <button onClick={() => setFilterCategory('security')} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterCategory === 'security' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:text-amber-300'}`}>Seguridad</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-lg">Producto & Modalidad</th>
                <th className="py-3 px-4">Clave Cifrada / Credencial</th>
                <th className="py-3 px-4">Cliente Asignado</th>
                <th className="py-3 px-4">Vigencia</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {/* Row 1 */}
              {(filterCategory === 'all' || filterCategory === 'office') && (filterStatus === 'all' || filterStatus === 'warning') && (
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                        <Grid className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">Office 365 Familia</div>
                        <div className="text-xs text-slate-400">Cupo 1 de 5 • 1TB</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs">
                    <div className="inline-flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg">
                      <span className="text-amber-300 tracking-wider">MS365-••••-9821</span>
                      <button onClick={() => handleCopy('MS365-88A9-9821')} className="text-slate-400 hover:text-amber-300"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400">MR</div>
                      <div className="flex flex-col">
                        <span className="text-white font-semibold leading-tight text-sm">Marcos Rodriguez</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-400 text-xs">+58 412 884-9102</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-slate-300">Act: 12 Mar 2024</span>
                      <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3.5 h-3.5" /> Faltan 4 días</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Renovación
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1 transition-all"><MessageCircle className="w-3.5 h-3.5" /> Notificar</button>
                      <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-400"><RefreshCcw className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}
              
              {/* Row 2 */}
              {(filterCategory === 'all' || filterCategory === 'security') && (filterStatus === 'all' || filterStatus === 'active') && (
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">Kaspersky Plus 2026</div>
                        <div className="text-xs text-slate-400">1 Dispositivo • Anual</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs">
                    <div className="inline-flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg">
                      <span className="text-amber-300 tracking-wider">KP26-••••-71A0</span>
                      <button onClick={() => handleCopy('KP26-71A0')} className="text-slate-400 hover:text-amber-300"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400">DL</div>
                      <div className="flex flex-col">
                        <span className="text-white font-semibold leading-tight text-sm">Dra. Lucía Mendoza</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-400 text-xs">+58 424 991-0023</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-slate-300">Act: 05 Ene 2026</span>
                      <span className="font-mono text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5"><CheckCircle className="w-3.5 h-3.5" /> 282 días</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Vigente
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-400"><RefreshCcw className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Row 3 - Vault */}
              {(filterCategory === 'all' || filterCategory === 'streaming') && (filterStatus === 'all' || filterStatus === 'vault') && (
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-700/20 text-red-400 flex items-center justify-center">
                        <PlayCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">YouTube Premium</div>
                        <div className="text-xs text-slate-400">Grupo Familiar</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs">
                    <div className="inline-flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg">
                      <span className="text-slate-400 tracking-wider">VAULT-INV-••••</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-slate-500 italic">Sin cliente asignado</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-slate-400">Reserva: 30 días</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> En Bóveda
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs flex items-center gap-1 transition-all"
                        onClick={() => {
                          setAssignProduct('YouTube Premium');
                          setAssignModalOpen(true);
                        }}
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Asignar
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-950 shadow-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-xl text-white font-bold">Asignar Licencia a Cliente</h3>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => setAssignModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setAssignModalOpen(false); }}>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Producto / Licencia</label>
                <input className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" type="text" value={assignProduct || "Seleccione de la bóveda..."} onChange={(e) => setAssignProduct(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Nombre Completo del Cliente</label>
                <input className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" placeholder="Ej: Roberto Gómez" required type="text" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Número de WhatsApp</label>
                  <input className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" placeholder="+58 414 000-0000" required type="text" />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Vigencia / Duración</label>
                  <select className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5">
                    <option>1 Mes (30 días)</option>
                    <option>3 Meses (90 días)</option>
                    <option>1 Año (365 días)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button type="button" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm" onClick={() => setAssignModalOpen(false)}>Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30">Confirmar Asignación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {batchModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-950 shadow-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-xl text-white font-bold">Cargar Lote de Claves / Bóveda</h3>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => setBatchModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setBatchModalOpen(false); }}>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Tipo de Software o Servicio</label>
                <select className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5">
                  <option>Microsoft Office 2024 Pro</option>
                  <option>Windows 11 Pro Retail</option>
                  <option>ESET NOD32 Internet Security</option>
                  <option>Netflix Perfiles Ultra HD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Pegar Claves (Una por línea)</label>
                <textarea className="w-full bg-slate-900 text-amber-300 font-mono text-xs px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" placeholder="XXXX-XXXX-XXXX-XXXX..." required rows={5}></textarea>
              </div>
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                <button type="button" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm" onClick={() => setBatchModalOpen(false)}>Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30">Cargar a la Bóveda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const ArchiveIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);
