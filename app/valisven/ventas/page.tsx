'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  X, 
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  MoreVertical,
  CheckCircle2,
  FileText,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  CalendarDays,
  Filter
} from 'lucide-react';

export default function VentasPage() {
  const supabase = createClient();
  
  // Data states
  const [ventas, setVentas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [licencias, setLicencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [ventasLimit, setVentasLimit] = useState(10);
  const [clientesLimit, setClientesLimit] = useState(10);

  // Modal states
  const [newSaleModal, setNewSaleModal] = useState(false);
  const [modalTab, setModalTab] = useState<'venta' | 'cliente'>('venta');
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', correo: '', celular: '' });
  const [nuevaVenta, setNuevaVenta] = useState({
    cliente_id: '',
    licencia_id: '', // Producto del catálogo
    tipo_venta: 'Nueva Venta',
    tiempo_vigencia: '1 Mes',
    precio_venta: '',
    ganancia_neta: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_vencimiento: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Ventas
    const { data: vData } = await supabase
      .from('valisven_ventas')
      .select(`
        *,
        cliente:valisven_clientes(*),
        licencia_activa:valisven_licencias_activas(
          *,
          producto_info:valisven_licencias(*)
        )
      `)
      .order('fecha', { ascending: false });
      
    // Fetch Clientes
    const { data: cData } = await supabase
      .from('valisven_clientes')
      .select('*')
      .order('fecha_registro', { ascending: false });
      
    // Fetch Catálogo de Licencias
    const { data: lData } = await supabase
      .from('valisven_licencias')
      .select('*')
      .order('producto', { ascending: true });

    if (vData) setVentas(vData);
    if (cData) setClientes(cData);
    if (lData) setLicencias(lData);
    
    setLoading(false);
  };

  const handleClienteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get user id for RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('valisven_clientes')
      .insert([{
        nombre: nuevoCliente.nombre,
        correo: nuevoCliente.correo,
        celular: nuevoCliente.celular,
        user_id: user.id
      }])
      .select()
      .single();
      
    setIsSubmitting(false);
    
    if (!error && data) {
      setClientes([data, ...clientes]);
      // Si estamos en modal, limpiar y cambiar de pestaña
      setNuevoCliente({ nombre: '', correo: '', celular: '' });
      setNuevaVenta({...nuevaVenta, cliente_id: data.id});
      setModalTab('venta');
      alert('Cliente registrado con éxito.');
    } else {
      alert('Error registrando cliente: ' + error?.message);
    }
  };

  const handleVentaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      // 1. Encontrar el producto base para saber los costos
      const productoBase = licencias.find(l => l.id === nuevaVenta.licencia_id);
      const costo_distribuidor = productoBase ? productoBase.costo_distribuidor : 0;
      
      // 2. Crear Licencia Activa (asumimos que creamos una nueva al momento de vender para simplificar)
      const { data: licActiva, error: errLic } = await supabase
        .from('valisven_licencias_activas')
        .insert([{
          licencia_id: nuevaVenta.licencia_id,
          cliente_id: nuevaVenta.cliente_id,
          fecha_activacion: nuevaVenta.fecha_inicio,
          fecha_vencimiento: nuevaVenta.fecha_vencimiento,
          estado: 'Activa',
          user_id: user.id
        }])
        .select()
        .single();
        
      if (errLic || !licActiva) throw new Error('Error creando licencia activa');
      
      // 3. Crear Venta
      const pVenta = parseFloat(nuevaVenta.precio_venta) || 0;
      const gNeta = parseFloat(nuevaVenta.ganancia_neta) || 0;
      
      const { error: errVen } = await supabase
        .from('valisven_ventas')
        .insert([{
          cliente_id: nuevaVenta.cliente_id,
          licencia_activa_id: licActiva.id,
          tipo_venta: nuevaVenta.tipo_venta,
          tiempo_vigencia: nuevaVenta.tiempo_vigencia,
          costo_distribuidor: costo_distribuidor,
          costo_venta: pVenta,
          ganancia_neta: gNeta,
          user_id: user.id
        }]);
        
      if (errVen) throw new Error('Error guardando la venta');
      
      alert('Venta registrada con éxito.');
      setNewSaleModal(false);
      fetchData(); // Recargar datos
      
    } catch (err: any) {
      alert(err.message);
    }
    
    setIsSubmitting(false);
  };

  // Helper para el estado de la venta
  const getEstadoVenta = (licencia_activa: any) => {
    if (!licencia_activa) return { texto: 'Desconocido', color: 'bg-slate-500/10 text-slate-400', icon: Clock };
    
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const venci = new Date(licencia_activa.fecha_vencimiento);
    
    if (venci < hoy) {
      return { texto: 'Vencida', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', icon: AlertTriangle };
    }
    
    return { texto: 'Completada / Activa', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle2 };
  };

  // Filtrar Ventas
  const filteredVentas = ventas.filter(v => {
    // Texto search
    const matchesSearch = !searchQuery || 
      v.cliente?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.id?.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Date filter
    const matchesDate = !filterDate || v.fecha?.startsWith(filterDate);
    
    // Product Type filter (basado en el string)
    let matchesType = true;
    if (filterProduct !== 'all') {
      const pName = v.licencia_activa?.producto_info?.producto?.toLowerCase() || '';
      const pType = v.licencia_activa?.producto_info?.tipo?.toLowerCase() || '';
      if (filterProduct === 'streaming') matchesType = pType.includes('streaming') || pName.includes('netflix') || pName.includes('spotify') || pName.includes('disney');
      if (filterProduct === 'office') matchesType = pType.includes('office') || pType.includes('windows') || pName.includes('office') || pName.includes('windows');
      if (filterProduct === 'antivirus') matchesType = pType.includes('seguridad') || pName.includes('kaspersky') || pName.includes('eset');
    }
    
    return matchesSearch && matchesDate && matchesType;
  });

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
            <span>Registrar</span>
          </button>
        </div>
      </div>

      {/* Main Content - VENTAS */}
      <section className="rounded-xl bg-slate-950/80 shadow-2xl p-4 sm:p-6 mb-8 border border-white/5">
        <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-amber-400"/> Historial de Ventas</h2>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
              <input 
                className="w-full bg-slate-900/90 text-white placeholder:text-slate-500 text-sm pl-12 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner" 
                placeholder="Buscar por cliente o ID de venta..." 
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
              <div className="relative group">
                <input 
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-slate-900 text-slate-300 hover:text-white text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/40"
                  title="Filtro de Fecha"
                />
              </div>
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

        {loading ? (
          <div className="text-center py-10 text-slate-400 animate-pulse">Cargando ventas...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-tl-lg">ID / Fecha</th>
                    <th className="py-3 px-4">Cliente & Producto</th>
                    <th className="py-3 px-4">Suscripción</th>
                    <th className="py-3 px-4 text-right">Precio Venta</th>
                    <th className="py-3 px-4 text-right">Ganancia Neta</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredVentas.slice(0, ventasLimit).map((sale) => {
                    const statusInfo = getEstadoVenta(sale.licencia_activa);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={sale.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-4 text-xs">
                          <div className="font-mono text-slate-400">{sale.id.split('-')[0].toUpperCase()}</div>
                          <div className="text-slate-500 mt-0.5">{new Date(sale.fecha).toLocaleDateString('es-PA')}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{sale.cliente?.nombre || 'Cliente Desconocido'}</span>
                            <span className="text-xs text-amber-400/80">
                              {sale.licencia_activa?.producto_info?.producto || 'Desconocido'} • {sale.tipo_venta}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                            <Clock className="w-3 h-3 mr-1" /> {sale.tiempo_vigencia}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-white font-bold">
                          B/. {parseFloat(sale.costo_venta).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-emerald-400 font-bold">
                          B/. {parseFloat(sale.ganancia_neta).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" /> {statusInfo.texto}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors" title="Ver Recibo">
                              <FileText className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredVentas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-500">No se encontraron ventas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredVentas.length > ventasLimit && (
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setVentasLimit(9999)}
                  className="text-xs text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Ver Todas las Ventas
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Main Content - CLIENTES */}
      <section className="rounded-xl bg-slate-950/80 shadow-2xl p-4 sm:p-6 mb-8 border border-white/5">
        <div className="flex flex-col gap-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><User className="w-5 h-5 text-cyan-400"/> Directorio de Clientes</h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 animate-pulse">Cargando clientes...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-tl-lg">Nombre del Cliente</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Fecha Registro</th>
                    <th className="py-3 px-4 text-right rounded-tr-lg">ID Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {clientes.slice(0, clientesLimit).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-950/60 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/20">
                            {c.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{c.nombre}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-xs">
                        {c.correo && <div className="flex items-center gap-1.5 mb-1"><Mail className="w-3 h-3 text-slate-500" /> {c.correo}</div>}
                        {c.celular && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {c.celular}</div>}
                        {!c.correo && !c.celular && <span className="italic">Sin contacto</span>}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(c.fecha_registro).toLocaleDateString('es-PA')}</div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-600">
                        {c.id.split('-')[0]}
                      </td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-500">No hay clientes registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {clientes.length > clientesLimit && (
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setClientesLimit(9999)}
                  className="text-xs text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Ver Todos los Clientes
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal Multi-Registro */}
      {newSaleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 shadow-2xl p-6 border border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl text-white font-bold">Registrar</h3>
              </div>
              <button className="text-slate-400 hover:text-white bg-slate-900/80 p-2 rounded-lg" onClick={() => setNewSaleModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex w-full mt-4 bg-slate-900 rounded-lg p-1">
              <button 
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${modalTab === 'venta' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setModalTab('venta')}
              >
                Nueva Venta
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${modalTab === 'cliente' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setModalTab('cliente')}
              >
                Nuevo Cliente
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 pt-6 pb-2">
              {modalTab === 'cliente' ? (
                <form id="cliente-form" className="flex flex-col gap-5" onSubmit={handleClienteSubmit}>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                      <User className="w-3.5 h-3.5" /> Nombre Completo
                    </label>
                    <input 
                      value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                      className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-cyan-500/40 outline-none border border-white/5" 
                      placeholder="Ej: Roberto Gómez" required type="text" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                        <Mail className="w-3.5 h-3.5" /> Correo Electrónico
                      </label>
                      <input 
                        value={nuevoCliente.correo} onChange={e => setNuevoCliente({...nuevoCliente, correo: e.target.value})}
                        className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-cyan-500/40 outline-none border border-white/5" 
                        placeholder="ejemplo@correo.com" type="email" 
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                        <Phone className="w-3.5 h-3.5" /> Celular / WhatsApp
                      </label>
                      <input 
                        value={nuevoCliente.celular} onChange={e => setNuevoCliente({...nuevoCliente, celular: e.target.value})}
                        className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-cyan-500/40 outline-none border border-white/5" 
                        placeholder="+507 6000-0000" type="text" 
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <form id="venta-form" className="flex flex-col gap-5" onSubmit={handleVentaSubmit}>
                  <div>
                    <label className="flex items-center justify-between gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Cliente</span>
                      <button type="button" onClick={() => setModalTab('cliente')} className="text-cyan-400 hover:underline">¿Crear Nuevo?</button>
                    </label>
                    <select 
                      value={nuevaVenta.cliente_id} onChange={e => setNuevaVenta({...nuevaVenta, cliente_id: e.target.value})}
                      className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" required>
                      <option value="">Selecciona un cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" /> Producto / Licencia
                      </label>
                      <select 
                        value={nuevaVenta.licencia_id} onChange={e => setNuevaVenta({...nuevaVenta, licencia_id: e.target.value})}
                        className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" required>
                        <option value="">Selecciona producto...</option>
                        {licencias.map(l => <option key={l.id} value={l.id}>{l.producto}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                        <Filter className="w-3.5 h-3.5" /> Tipo de Venta
                      </label>
                      <select 
                        value={nuevaVenta.tipo_venta} onChange={e => setNuevaVenta({...nuevaVenta, tipo_venta: e.target.value})}
                        className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5">
                        <option value="Nueva Venta">Nueva Licencia / Venta</option>
                        <option value="Renovación">Renovación de Existente</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                        <Clock className="w-3.5 h-3.5" /> Vigencia
                      </label>
                      <select 
                        value={nuevaVenta.tiempo_vigencia} onChange={e => setNuevaVenta({...nuevaVenta, tiempo_vigencia: e.target.value})}
                        className="w-full bg-slate-900 text-white text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5">
                        <option>30 Días</option>
                        <option>1 Mes</option>
                        <option>3 Meses</option>
                        <option>6 Meses</option>
                        <option>1 Año</option>
                        <option>Permanente (Lifetime)</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Fecha Inicio
                      </label>
                      <input 
                        value={nuevaVenta.fecha_inicio} onChange={e => setNuevaVenta({...nuevaVenta, fecha_inicio: e.target.value})}
                        className="w-full bg-slate-900 text-slate-300 text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" type="date" required />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Fecha Vencimiento
                      </label>
                      <input 
                        value={nuevaVenta.fecha_vencimiento} onChange={e => setNuevaVenta({...nuevaVenta, fecha_vencimiento: e.target.value})}
                        className="w-full bg-slate-900 text-slate-300 text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" type="date" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Precio de Venta (B/.)
                      </label>
                      <input 
                        value={nuevaVenta.precio_venta} onChange={e => setNuevaVenta({...nuevaVenta, precio_venta: e.target.value})}
                        className="w-full bg-slate-900 text-white font-mono text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-amber-500/40 outline-none border border-white/5" placeholder="0.00" required type="number" step="0.01" />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Ganancia Neta (B/.)
                      </label>
                      <input 
                        value={nuevaVenta.ganancia_neta} onChange={e => setNuevaVenta({...nuevaVenta, ganancia_neta: e.target.value})}
                        className="w-full bg-emerald-950/20 text-emerald-400 font-mono text-sm px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/40 outline-none border border-emerald-500/20" placeholder="0.00" required type="number" step="0.01" />
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button type="button" className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-semibold transition-colors" onClick={() => setNewSaleModal(false)}>Cancelar</button>
              {modalTab === 'cliente' ? (
                <button disabled={isSubmitting} form="cliente-form" type="submit" className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50">Guardar Cliente</button>
              ) : (
                <button disabled={isSubmitting} form="venta-form" type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50">Guardar Venta</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
