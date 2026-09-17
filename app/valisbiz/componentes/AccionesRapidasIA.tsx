'use client';

import { useState, useRef, useTransition, useEffect, Fragment } from 'react';
import {
  Sparkles, Send, X, Loader2, CheckCircle2, AlertCircle,
  ImagePlus, Eye, ShoppingCart, XCircle as XCircleIcon,
  Banknote, CreditCard, Calculator, Building2, FileText,
  Minimize2, Bot, SkipForward, Check
} from 'lucide-react';
import { analizarReporteValisBiz, type DatosIAVendedor } from '../acciones/ia';
import { registrarVenta, registrarFacturado } from '../acciones/dashboard';
import { registrarVisita } from '../acciones/crm';

interface Vendedor { id: string; nombre: string; }
interface Local { id: string; nombre_local: string; vendedor_id?: string | null; tipo?: string; }

interface AccionesRapidasIAProps {
  vendedores: Vendedor[];
  locales: Local[];
  onSuccess: () => void;
}

type EstadoIA = 'idle' | 'analizando' | 'cola' | 'guardando' | 'exito' | 'error';
type EstadoItem = 'pendiente' | 'guardado' | 'omitido';

interface ItemCola extends DatosIAVendedor {
  _estado: EstadoItem;
  _vendedorId: string;
  _fecha: string;
  _notas: string;
  _vistas: string;
  _conCompra: string;
  _sinCompra: string;
  _contado: string;
  _credito: string;
  _tab: 'facturado' | 'vendido' | 'visita';
  
  // Para visita
  _localId: string;
  _searchLocal: string; // texto del input de búsqueda
  _ordenPedido: string;
  _montoReportado: string;
}

// ── Compresión de imagen en cliente (Canvas) ────────────────────────────────
async function comprimirImagen(file: File, maxPx = 900, calidad = 0.75): Promise<{ base64: string; mime: string }> {
  // PDFs: enviar sin comprimir
  if (file.type === 'application/pdf') {
    const buf = await file.arrayBuffer();
    return { base64: Buffer.from(buf).toString('base64'), mime: file.type };
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', calidad);
      const base64 = dataUrl.split(',')[1];
      resolve({ base64, mime: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = url;
  });
}

function fmt2(n: number) {
  return n.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buscarVendedor(nombre: string | undefined, vendedores: Vendedor[]): string {
  if (!nombre) return '';
  const n = nombre.toLowerCase().trim();
  const exacto = vendedores.find(v => v.nombre.toLowerCase() === n);
  if (exacto) return exacto.id;
  const parcial = vendedores.find(v =>
    v.nombre.toLowerCase().split(' ').some(part => n.includes(part) || part.includes(n.split(' ')[0]))
  );
  return parcial?.id || '';
}

function buscarLocal(nombre: string | undefined, locales: Local[]): string {
  if (!nombre) return '';
  const n = nombre.toLowerCase().trim();
  const exacto = locales.find(l => l.nombre_local.toLowerCase() === n);
  if (exacto) return exacto.id;
  
  // Búsqueda parcial: contar cuántas palabras coinciden
  const palabras = n.split(' ').filter(p => p.length > 2);
  let mejorMatch = '';
  let maxCoincidencias = 0;
  
  for (const l of locales) {
    const nombreLocal = l.nombre_local.toLowerCase();
    let coincidencias = 0;
    for (const p of palabras) {
      if (nombreLocal.includes(p)) coincidencias++;
    }
    if (coincidencias > maxCoincidencias) {
      maxCoincidencias = coincidencias;
      mejorMatch = l.id;
    }
  }
  
  return mejorMatch;
}

function construirItem(d: DatosIAVendedor, vendedores: Vendedor[], locales: Local[]): ItemCola {
  const today = new Date().toISOString().split('T')[0];
  const _localId = buscarLocal(d.local_nombre, locales);
  const localEncontrado = locales.find(l => l.id === _localId);
  const _vendedorId = buscarVendedor(d.vendedor_nombre, vendedores) || localEncontrado?.vendedor_id || '';
  
  return {
    ...d,
    _estado: 'pendiente',
    _vendedorId,
    _fecha: d.fecha || today,
    _notas: d.notas || '',
    _vistas: d.vistas?.toString() || '0',
    _conCompra: d.con_compra?.toString() || '0',
    _sinCompra: d.sin_compra?.toString() || '0',
    _contado: d.contado?.toString() || '0',
    _credito: d.credito?.toString() || '0',
    _tab: d.tipo === 'facturado' ? 'facturado' : d.tipo === 'visita' ? 'visita' : 'vendido',
    _localId: buscarLocal(d.local_nombre, locales),
    _searchLocal: d.local_nombre || '',
    _ordenPedido: d.orden_pedido || '',
    _montoReportado: d.monto_reportado?.toString() || '',
  };
}

// ── Chips de progreso ─────────────────────────────────────────────────────────
function ChipsProgreso({ cola, actual }: { cola: ItemCola[]; actual: number }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {cola.map((item, i) => {
        const nombre = item.vendedor_nombre?.split(' ')[0] || `#${i + 1}`;
        if (item._estado === 'guardado') return (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
            <Check className="w-3 h-3" />{nombre}
          </span>
        );
        if (item._estado === 'omitido') return (
          <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-400 line-through">{nombre}</span>
        );
        if (i === actual) return (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500 text-white ring-2 ring-purple-300">
            {nombre}
          </span>
        );
        return <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-500">{nombre}</span>;
      })}
    </div>
  );
}

// ── Formulario de un ítem ─────────────────────────────────────────────────────
function FormularioItem({ item, vendedores, locales, onChange }: {
  item: ItemCola; vendedores: Vendedor[]; locales: Local[]; onChange: (c: Partial<ItemCola>) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const total = (parseFloat(item._contado) || 0) + (parseFloat(item._credito) || 0);
  const inp = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all";
  const localSeleccionado = locales.find(l => l.id === item._localId);

  return (
    <div className="flex flex-col gap-3">
      {/* Tab tipo */}
      <div className="flex rounded-xl border border-white/10 overflow-hidden bg-white/5 text-xs">
        {item._tab === 'visita' ? (
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold bg-[#121c27] text-emerald-400 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Visita / Factura
          </div>
        ) : (
          <>
            <button onClick={() => onChange({ _tab: 'facturado' })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold transition-all ${item._tab === 'facturado' ? 'bg-[#121c27] text-pink-400 shadow-sm' : 'text-slate-400'}`}>
              <Building2 className="w-3.5 h-3.5" /> Facturado
            </button>
            <button onClick={() => onChange({ _tab: 'vendido' })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold transition-all ${item._tab === 'vendido' ? 'bg-[#121c27] text-blue-400 shadow-sm' : 'text-slate-400'}`}>
              <FileText className="w-3.5 h-3.5" /> Vendido
            </button>
          </>
        )}
      </div>

      {/* Vendedor + Fecha */}
      <div className={`grid gap-2 ${item._tab === 'visita' ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {item._tab !== 'visita' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vendedor *</label>
            <select value={item._vendedorId} onChange={e => onChange({ _vendedorId: e.target.value })} className={`${inp} text-slate-300`}>
              <option value="">Seleccionar...</option>
              {vendedores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
          <input type="date" value={item._fecha} onChange={e => onChange({ _fecha: e.target.value })} className={inp} />
        </div>
      </div>

      {item._tab === 'visita' && (
        <div className="flex flex-col gap-3 relative">
          <div className="relative">
            <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Punto de Venta (Local) *</label>
            <input 
              required
              type="text"
              value={item._searchLocal}
              onChange={e => {
                onChange({ _searchLocal: e.target.value, _localId: '' });
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Buscar local..."
              className={`${inp} text-slate-300 bg-emerald-500/10 border-emerald-500/30 relative z-[51]`}
            />
            {showDropdown && (
              <div className="absolute top-[60px] left-0 right-0 max-h-48 overflow-y-auto bg-[#121c27] border border-white/10 rounded-xl shadow-xl z-[60]">
                {locales.filter(l => !item._searchLocal || l.nombre_local.toLowerCase().includes(item._searchLocal.toLowerCase())).map(l => (
                  <div 
                    key={l.id} 
                    className="px-3 py-2 text-xs hover:bg-emerald-500/20 cursor-pointer text-slate-300"
                    onClick={() => {
                      onChange({
                        _localId: l.id,
                        _searchLocal: l.nombre_local,
                        _vendedorId: l.vendedor_id || item._vendedorId
                      });
                      setShowDropdown(false);
                    }}
                  >
                    {l.nombre_local} <span className="text-slate-500">({l.tipo || 'Local'})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {localSeleccionado && localSeleccionado.vendedor_id && (
            <div className="text-[10px] text-slate-400 px-1 -mt-2">
              Vendedor asignado: <span className="font-bold text-slate-300">{vendedores.find(v => v.id === localSeleccionado.vendedor_id)?.nombre || '...'}</span>
            </div>
          )}

          {(!item._localId || (localSeleccionado && !localSeleccionado.vendedor_id)) && (
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Asignar Vendedor *</label>
              <select value={item._vendedorId} onChange={e => onChange({ _vendedorId: e.target.value })} className={`${inp} text-slate-300 bg-amber-500/5 border-amber-500/30`}>
                <option value="">Seleccionar quién realizó la visita...</option>
                {vendedores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monto Facturado (B/.)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                <input type="number" step="0.01" min="0" value={item._montoReportado} onChange={e => onChange({ _montoReportado: e.target.value })} placeholder="0.00" className={`${inp} pl-9`} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Orden de Pedido</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">N°</span>
                <input type="text" value={item._ordenPedido} onChange={e => onChange({ _ordenPedido: e.target.value })} placeholder="12345" className={`${inp} pl-8`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {item._tab === 'facturado' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Banknote className="w-3 h-3" /> Contado (B/.)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                <input type="number" step="0.01" min="0" value={item._contado} onChange={e => onChange({ _contado: e.target.value })} placeholder="0.00" className={`${inp} pl-9`} />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                <CreditCard className="w-3 h-3" /> Crédito (B/.)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                <input type="number" step="0.01" min="0" value={item._credito} onChange={e => onChange({ _credito: e.target.value })} placeholder="0.00" className={`${inp} pl-9`} />
              </div>
            </div>
          </div>
          {/* Total calculado */}
          <div className="flex items-center justify-between bg-pink-50 rounded-xl px-3 py-2 border border-pink-200">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calculator className="w-3 h-3 text-pink-500" /> Total del día
            </span>
            <span className="font-mono font-bold text-pink-400 text-sm">
              B/.{((parseFloat(item._contado) || 0) + (parseFloat(item._credito) || 0)).toLocaleString('es-PA', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notas</label>
            <input type="text" value={item._notas} onChange={e => onChange({ _notas: e.target.value })} placeholder="Opcional" className={inp} />
          </div>
        </>
      )}

      {item._tab === 'vendido' && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Vistas', key: '_vistas', Icon: Eye, cls: inp },
              { label: 'Con Compra', key: '_conCompra', Icon: ShoppingCart, cls: "w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" },
              { label: 'Sin Compra', key: '_sinCompra', Icon: XCircleIcon, cls: "w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-300 transition-all" },
            ].map(({ label, key, Icon: Ic, cls }) => (
              <div key={key}>
                <label className="flex items-center gap-0.5 text-[11px] font-semibold text-slate-400 mb-1"><Ic className="w-3 h-3" /> {label}</label>
                <input type="number" min="0" value={(item as any)[key]} onChange={e => onChange({ [key]: e.target.value } as any)} className={`${cls} text-center`} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Contado', key: '_contado', Icon: Banknote },
              { label: 'Crédito', key: '_credito', Icon: CreditCard },
            ].map(({ label, key, Icon: Ic }) => (
              <div key={key}>
                <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-1"><Ic className="w-3 h-3 text-slate-400" /> {label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                  <input type="number" step="0.01" min="0" value={(item as any)[key]} onChange={e => onChange({ [key]: e.target.value } as any)} className={`${inp} pl-8`} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
            <div className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-400">Total</span>
            </div>
            <span className="font-mono text-base font-bold text-blue-400">B/.{fmt2(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AccionesRapidasIA({ vendedores, locales, onSuccess }: AccionesRapidasIAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [estado, setEstado] = useState<EstadoIA>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resumen, setResumen] = useState('');
  const [cola, setCola] = useState<ItemCola[]>([]);
  const [indexActual, setIndexActual] = useState(0);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Andrés: 12 vistas, 9 con compra, 3 sin compra, 1877 contado, 2162 crédito',
    'Subir foto del reporte diario',
    'Joseph vendió hoy 686 al contado',
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [estado, cola, indexActual]);

  const resetTodo = () => {
    setTexto(''); setArchivo(null); setEstado('idle'); setIsDragging(false);
    setErrorMsg(''); setResumen(''); setCola([]); setIndexActual(0);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') setArchivo(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        e.preventDefault();
        setArchivo(file);
      }
    }
  };

  const handleAnalizar = () => {
    if (!texto.trim() && !archivo) return;
    setEstado('analizando');
    setErrorMsg('');
    startTransition(async () => {
      let base64: string | undefined;
      let mimeT: string | undefined;
      if (archivo) {
        try {
          // Comprime la imagen antes de enviar (4MB → ~150KB)
          const comprimido = await comprimirImagen(archivo);
          base64 = comprimido.base64;
          mimeT = comprimido.mime;
        } catch {
          // fallback sin comprimir
          const buf = await archivo.arrayBuffer();
          base64 = Buffer.from(buf).toString('base64');
          mimeT = archivo.type;
        }
      }
      const r = await analizarReporteValisBiz(texto, base64, mimeT);
      if (!r.success || !r.data || r.data.registros.length === 0) {
        setEstado('error');
        setErrorMsg(r.error || 'No se encontraron datos');
        return;
      }
      setCola(r.data.registros.map(d => construirItem(d, vendedores, locales)));
      setResumen(r.data.resumen);
      setIndexActual(0);
      setEstado('cola');
      setTexto('');
      setArchivo(null);
    });
  };

  const updateItem = (campos: Partial<ItemCola>) => {
    setCola(prev => prev.map((it, i) => i === indexActual ? { ...it, ...campos } : it));
  };

  const handleGuardar = () => {
    const item = cola[indexActual];
    if (!item._vendedorId) { setErrorMsg('Selecciona un vendedor.'); return; }
    setErrorMsg('');
    setEstado('guardando');
    startTransition(async () => {
      const fecha = new Date(item._fecha + 'T12:00:00');
      let res: { success: boolean; error?: string } = { success: false, error: 'Acción no reconocida' };
      if (item._tab === 'facturado') {
        const contado = parseFloat(item._contado) || 0;
        const credito = parseFloat(item._credito) || 0;
        if (contado + credito <= 0) { setErrorMsg('Contado + Crédito debe ser mayor a 0.'); setEstado('cola'); return; }
        res = await registrarFacturado(item._vendedorId, contado, credito, fecha, item._notas);
      } else if (item._tab === 'visita') {
        if (!item._localId) { setErrorMsg('Selecciona el local.'); setEstado('cola'); return; }
        res = await registrarVisita({
          local_id: item._localId,
          vendedor_id: item._vendedorId,
          estado_visita: 'con_compra',
          fecha: item._fecha,
          monto_reportado: parseFloat(item._montoReportado) || null,
          orden_pedido: item._ordenPedido || null,
        }).then(() => ({ success: true })).catch((err) => ({ success: false, error: err.message }));
      } else {
        const total = (parseFloat(item._contado) || 0) + (parseFloat(item._credito) || 0);
        res = await registrarVenta(item._vendedorId, total, undefined, fecha, {
          vistas: parseInt(item._vistas) || 0,
          con_compra: parseInt(item._conCompra) || 0,
          sin_compra: parseInt(item._sinCompra) || 0,
          contado: parseFloat(item._contado) || 0,
          credito: parseFloat(item._credito) || 0,
        });
      }
      if (!res.success) { setErrorMsg('Error: ' + res.error); setEstado('cola'); return; }
      const nueva = cola.map((it, i) => i === indexActual ? { ...it, _estado: 'guardado' as EstadoItem } : it);
      setCola(nueva);
      onSuccess();
      const sig = nueva.findIndex((it, i) => i > indexActual && it._estado === 'pendiente');
      if (sig !== -1) { setIndexActual(sig); setEstado('cola'); }
      else {
        const any = nueva.findIndex(it => it._estado === 'pendiente');
        if (any !== -1) { setIndexActual(any); setEstado('cola'); }
        else { setTexto(''); setArchivo(null); setEstado('exito'); }
      }
    });
  };

  const handleOmitir = () => {
    const nueva = cola.map((it, i) => i === indexActual ? { ...it, _estado: 'omitido' as EstadoItem } : it);
    setCola(nueva);
    const sig = nueva.findIndex((it, i) => i > indexActual && it._estado === 'pendiente');
    if (sig !== -1) setIndexActual(sig);
    else {
      const any = nueva.findIndex(it => it._estado === 'pendiente');
      if (any !== -1) setIndexActual(any);
      else { setTexto(''); setArchivo(null); setEstado('exito'); }
    }
  };

  const itemActual = cola[indexActual];
  const guardados = cola.filter(it => it._estado === 'guardado').length;
  const omitidos = cola.filter(it => it._estado === 'omitido').length;
  const pendientes = cola.filter(it => it._estado === 'pendiente').length;

  // ── Botón flotante (cerrado) ────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50 group"
        aria-label="Abrir asistente IA ValisBiz"
      >
        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
      </button>
    );
  }

  // ── Panel abierto ───────────────────────────────────────────────────────────
  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`fixed bottom-24 right-4 lg:bottom-6 lg:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[640px] max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-2rem)] bg-[#121c27] rounded-2xl shadow-2xl border flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 transition-colors ${isDragging ? 'border-purple-500 bg-purple-900/20' : 'border-white/10'}`}>

      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#121c27]/80 backdrop-blur-sm border-2 border-dashed border-purple-500 rounded-2xl m-2 pointer-events-none">
          <ImagePlus className="w-12 h-12 text-purple-400 mb-2 animate-bounce" />
          <p className="text-purple-300 font-bold text-lg">Suelta la imagen aquí</p>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-purple-700 to-pink-600 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#121c27]/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">IA Gemini · ValisBiz</h3>
            <p className="text-xs text-purple-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-pulse" />
              Ventas &amp; Reportes Diarios
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(estado !== 'idle') && (
            <button onClick={resetTodo} className="p-2 hover:bg-[#121c27]/20 rounded-xl transition-colors" title="Nueva consulta">
              <Bot className="w-4 h-4 text-purple-100" />
            </button>
          )}
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-[#121c27]/20 rounded-xl transition-colors">
            <Minimize2 className="w-5 h-5 text-purple-100" />
          </button>
        </div>
      </div>

      {/* ── Área de contenido ── */}
      <div className="flex-1 overflow-y-auto p-4 bg-white/5 flex flex-col gap-4">

        {/* Pantalla inicial con sugerencias */}
        {estado === 'idle' && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-[#121c27] p-5 rounded-2xl border border-white/5 shadow-sm">
              <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                ¡Hola! Soy tu asistente de ventas
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Escríbeme el reporte del día o súbeme una foto del Excel Keiko. Extraigo los datos de los 3 vendedores de una sola vez.
              </p>
              <div className="flex flex-col gap-2">
                {quickPrompts.map((prompt, i) => (
                  <button key={i}
                    onClick={() => i === 1 ? fileRef.current?.click() : (setTexto(prompt))}
                    className="text-left text-xs bg-white/5 hover:bg-purple-50 text-slate-300 hover:text-purple-700 border border-white/10 hover:border-purple-200 px-3 py-2.5 rounded-xl transition-colors w-full">
                    {i === 1 ? '📸 ' : '💬 '}{prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analizando */}
        {estado === 'analizando' && (
          <div className="flex justify-start">
            <div className="bg-[#121c27] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              <span className="text-xs font-medium">Gemini analizando el reporte...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {estado === 'error' && (
          <div className="flex justify-start">
            <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold">No pude analizar el contenido</span>
              </div>
              <p className="text-xs text-red-500">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Cola de registros */}
        {(estado === 'cola' || estado === 'guardando') && itemActual && (
          <div className="flex flex-col gap-3">

            {/* Mensaje IA con resumen */}
            <div className="flex justify-start">
              <div className="bg-[#121c27] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[90%]">
                <p className="text-xs font-medium text-slate-300 mb-2">{resumen}</p>
                <ChipsProgreso cola={cola} actual={indexActual} />
              </div>
            </div>

            {/* Formulario del registro actual */}
            <div className="flex justify-end">
              <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs font-medium max-w-[85%]">
                Registro {indexActual + 1} de {cola.length} · {itemActual.vendedor_nombre || 'Vendedor'}
              </div>
            </div>

            <div className="bg-[#121c27] border border-white/10 rounded-2xl rounded-tl-sm p-4 shadow-sm">
              <FormularioItem item={itemActual} vendedores={vendedores} locales={locales} onChange={updateItem} />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errorMsg}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button onClick={handleOmitir} disabled={estado === 'guardando'}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10 text-slate-500 text-xs font-semibold hover:bg-white/5 disabled:opacity-50 transition-colors">
                <SkipForward className="w-3.5 h-3.5" /> Omitir
              </button>
              <button onClick={handleGuardar} disabled={estado === 'guardando' || !itemActual._vendedorId}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-sm font-bold shadow transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {estado === 'guardando'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  : pendientes > 1
                    ? <><CheckCircle2 className="w-4 h-4" /> Guardar y siguiente</>
                    : <><CheckCircle2 className="w-4 h-4" /> Guardar</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Éxito total */}
        {estado === 'exito' && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-start">
              <div className="bg-[#121c27] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm max-w-[90%]">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-slate-200 text-sm">¡Listo! Guardado con éxito.</span>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  He procesado todo correctamente. ¿Necesitas que te ayude con otro registro o reporte?
                </p>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-slate-500">
                    ✅ {guardados} guardados{omitidos > 0 ? ` · ⏭ ${omitidos} omitidos` : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={resetTodo}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow shadow-pink-500/20 text-xs font-bold hover:from-purple-700 hover:to-pink-600 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Claro, analizar otro
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="p-4 bg-[#121c27] border-t border-white/10 shrink-0">
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
          onChange={e => { setArchivo(e.target.files?.[0] || null); }} />

        {archivo && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl">
            <ImagePlus className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
            <span className="text-xs text-purple-700 flex-1 truncate">{archivo.name}</span>
            <button onClick={() => setArchivo(null)} className="text-slate-400 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="relative flex items-center">
          <button onClick={() => fileRef.current?.click()}
            className="absolute left-3 text-slate-400 hover:text-purple-500 transition-colors">
            <ImagePlus className="w-4 h-4" />
          </button>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalizar(); } }}
            onPaste={handlePaste}
            placeholder="Ej: Andrés: 12 vistas, 9 con compra…"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none min-h-[44px] max-h-32"
            rows={1}
            disabled={estado === 'analizando' || estado === 'guardando'}
          />
          <button onClick={handleAnalizar}
            disabled={(!texto.trim() && !archivo) || estado === 'analizando' || estado === 'guardando'}
            className="absolute right-2 p-2 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          La IA puede cometer errores · revisa antes de guardar
        </p>
      </div>
    </div>
  );
}
