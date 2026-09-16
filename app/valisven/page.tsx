'use client';

import { 
  TrendingUp, 
  Wallet, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Shield,
  PlayCircle,
  Grid
} from 'lucide-react';
import Link from 'next/link';

export default function ValisVenInicioPage() {
  const recentActivity = [
    { id: '1', type: 'venta', product: 'Office 365 Familia', client: 'Marcos Rodriguez', date: 'Hace 2 horas', amount: 'B/. 25.00', icon: Grid, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { id: '2', type: 'venta', product: 'Netflix Perfil 4K', client: 'Carlos Hernández', date: 'Hace 5 horas', amount: 'B/. 8.00', icon: PlayCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: '3', type: 'renovacion', product: 'Kaspersky Plus 2026', client: 'Dra. Lucía Mendoza', date: 'Ayer', amount: 'B/. 20.00', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { id: '4', type: 'venta', product: 'Windows 11 Pro OEM', client: 'Alejandro Peña', date: 'Ayer', amount: 'B/. 19.00', icon: Grid, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: '5', type: 'venta', product: 'Disney+ Premium', client: 'Elena Silva', date: 'Hace 2 días', amount: 'B/. 10.00', icon: PlayCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Bienvenido a ValisVen</h1>
          <p className="text-slate-400 mt-1">Resumen general de tu negocio de licencias digitales.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/valisven/ventas" className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all">
            Registrar Venta
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-slate-950/70 p-5 shadow-lg border border-white/5 relative overflow-hidden group hover:bg-slate-900/70 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Ventas del Mes</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-amber-400 font-bold">B/.</span>
                <span className="text-3xl font-mono text-white font-bold">14,820</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/70 p-5 shadow-lg border border-white/5 relative overflow-hidden group hover:bg-slate-900/70 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Ganancias Netas</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-emerald-400 font-bold">B/.</span>
                <span className="text-3xl font-mono text-white font-bold">9,410</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/70 p-5 shadow-lg border border-white/5 relative overflow-hidden group hover:bg-slate-900/70 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-400"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Licencias por Vencer</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-mono text-amber-300 font-bold">18</span>
                <span className="text-xs text-slate-400">esta semana</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="w-full bg-slate-950/80 rounded-xl shadow-xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Actividad Reciente</h2>
          </div>
          <Link href="/valisven/ventas" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
            Ver todo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4 font-semibold">Producto</th>
                <th className="pb-3 px-4 font-semibold">Cliente</th>
                <th className="pb-3 px-4 font-semibold">Monto</th>
                <th className="pb-3 px-4 font-semibold text-right">Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <tr key={activity.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${activity.bg} ${activity.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{activity.product}</div>
                          <div className="text-xs text-slate-500">{activity.type === 'venta' ? 'Nueva Venta' : 'Renovación'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-slate-200">{activity.client}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-mono font-bold text-emerald-400">{activity.amount}</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-xs text-slate-400">{activity.date}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
