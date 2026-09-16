'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  X, 
  Filter, 
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  MoreVertical,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function VentasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [newSaleModal, setNewSaleModal] = useState(false);

  const salesData = [
    { id: 'V-1045', client: 'Marcos Rodriguez', product: 'Office 365 Familia', date: '12 Oct 2026', amount: 'B/. 25.00', profit: 'B/. 16.00', status: 'Completada', type: 'Renovación' },
    { id: 'V-1044', client: 'Carlos Hernández', product: 'Netflix Perfil 4K', date: '12 Oct 2026', amount: 'B/. 8.00', profit: 'B/. 4.50', status: 'Completada', type: 'Nueva Venta' },
    { id: 'V-1043', client: 'Dra. Lucía Mendoza', product: 'Kaspersky Plus', date: '11 Oct 2026', amount: 'B/. 20.00', profit: 'B/. 11.00', status: 'Completada', type: 'Nueva Venta' },
    { id: 'V-1042', client: 'Alejandro Peña', product: 'Windows 11 Pro', date: '11 Oct 2026', amount: 'B/. 19.00', profit: 'B/. 14.00', status: 'Completada', type: 'Nueva Venta' },
    { id: 'V-1041', client: 'Elena Silva', product: 'Disney+ Premium', date: '09 Oct 2026', amount: 'B/. 10.00', profit: 'B/. 5.50', status: 'Completada', type: 'Renovación' },
    { id: 'V-1040', client: 'Juan Pérez', product: 'Spotify Premium', date: '08 Oct 2026', amount: 'B/. 6.00', profit: 'B/. 3.50', status: 'Completada', type: 'Renovación' },
  ];

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewSaleModal(false);
    // show success toast here
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-amber-400" />
            Gestión de Ventas
          </h1>
          <p className="text-slate-400 mt-1">Registra y monitorea todas las transacciones comerciales.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            onClick={() => setNewSaleModal(true)}
          >
            <Plus className="w-5 h-5" />
            <span>Registrar Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <section className="rounded-xl bg-slate-950/80 shadow-2xl p-4 sm:p-6 mb-8 border border-white/5">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
              <input 
                className="w-full bg-slate-900/90 text-white placeholder:text-slate-500 text-sm pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner" 
                placeholder="Buscar por cliente, recibo o producto..." 
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
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-sm font-semibold transition-all">
                <Calendar className="w-4 h-4" /> Filtro de Fecha
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-sm font-semibold transition-all">
                <Filter className="w-4 h-4" /> Exportar CSV
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-2">Filtro Rápido:</span>
            <button onClick={() => setFilterProduct('all')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterProduct === 'all' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-300 hover:text-amber-300'}`}>Todos</button>
            <button onClick={() => setFilterProduct('streaming')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterProduct === 'streaming' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-300 hover:text-amber-300'}`}>Streaming</button>
            <button onClick={() => setFilterProduct('office')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterProduct === 'office' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-300 hover:text-amber-300'}`}>Office & Windows</button>
            <button onClick={() => setFilterProduct('antivirus')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterProduct === 'antivirus' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-900 text-slate-300 hover:text-amber-300'}`}>Antivirus</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 rounded-tl-lg">ID Venta</th>
                <th className="py-3 px-4">Cliente & Producto</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-right">Ganancia Neta</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {salesData.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-slate-400">
                    {sale.id}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{sale.client}</span>
                      <span className="text-xs text-amber-400/80">{sale.product} • {sale.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300 text-sm">
                    {sale.date}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-white font-bold">
                    {sale.amount}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-400 font-bold">
                    {sale.profit}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> {sale.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300" title="Ver Recibo">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Nueva Venta */}
      {newSaleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 shadow-2xl p-6 border border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-xl text-white font-bold">Registrar Nueva Venta</h3>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => setNewSaleModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pt-4 pb-2">
              <form id="sale-form" className="flex flex-col gap-5" onSubmit={handleSaleSubmit}>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                    <User className="w-3.5 h-3.5" /> Nombre del Cliente
                  </label>
                  <input className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" placeholder="Ej: Roberto Gómez" required type="text" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" /> Producto / Licencia
                    </label>
                    <select className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5">
                      <option value="">Selecciona un producto...</option>
                      <option>Microsoft 365</option>
                      <option>Netflix</option>
                      <option>Spotify</option>
                      <option>Antivirus (Kaspersky/ESET)</option>
                      <option>Windows 11</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                      <Filter className="w-3.5 h-3.5" /> Tipo de Venta
                    </label>
                    <select className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5">
                      <option>Nueva Licencia (Asignación desde Bóveda)</option>
                      <option>Renovación de Licencia Existente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Fecha de Inicio
                    </label>
                    <input className="w-full bg-slate-900 text-slate-300 text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Fecha de Vencimiento
                    </label>
                    <input className="w-full bg-slate-900 text-slate-300 text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" type="date" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Precio de Venta (B/.)
                    </label>
                    <input className="w-full bg-slate-900 text-white font-mono text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" placeholder="0.00" required type="number" step="0.01" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Ganancia Neta (B/.)
                    </label>
                    <input className="w-full bg-emerald-950/20 text-emerald-400 font-mono text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/40 outline-none border border-emerald-500/20" placeholder="0.00" required type="number" step="0.01" />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-semibold transition-colors" onClick={() => setNewSaleModal(false)}>Cancelar</button>
              <button form="sale-form" type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition-all">Guardar Venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
