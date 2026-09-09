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

interface Vendedor { id: string; nombre: string; }
interface AccionesRapidasIAProps {
  vendedores: Vendedor[];
  onSuccess: () => void;
}

type EstadoIA = 'idle' | 'analizando' | 'cola' | 'guardando' | 'exito' | 'error';
type EstadoItem = 'pendiente' | 'guardado' | 'omitido';

interface ItemCola extends DatosIAVendedor {
  _estado: EstadoItem;
  _vendedorId: string;
  _fecha: string;
  _monto: string;
  _notas: string;
  _vistas: string;
  _conCompra: string;
  _sinCompra: string;
  _contado: string;
  _credito: string;
  _tab: 'facturado' | 'vendido';
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

function construirItem(d: DatosIAVendedor, vendedores: Vendedor[]): ItemCola {
  const today = new Date().toISOString().split('T')[0];
  return {
    ...d,
    _estado: 'pendiente',
    _vendedorId: buscarVendedor(d.vendedor_nombre, vendedores),
    _fecha: d.fecha || today,
    _monto: d.monto_facturado?.toString() || '',
    _notas: d.notas || '',
    _vistas: d.vistas?.toString() || '0',
    _conCompra: d.con_compra?.toString() || '0',
    _sinCompra: d.sin_compra?.toString() || '0',
    _contado: d.contado?.toString() || '0',
    _credito: d.credito?.toString() || '0',
    _tab: d.tipo === 'facturado' ? 'facturado' : 'vendido',
  };
}

// ── Chips de progreso ─────────────────────────────────────────────────────────
function ChipsProgreso({ cola, actual }: { cola: ItemCola[]; actual: number }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {cola.map((item, i) => {
        const nombre = item.vendedor_nombre?.split(' ')[0] || `#${i + 1}`;
        if (item._estado === 'guardado') return (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
            <Check className="w-3 h-3" />{nombre}
          </span>
        );
        if (item._estado === 'omitido') return (
          <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-400 line-through">{nombre}</span>
        );
        if (i === actual) return (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500 text-white ring-2 ring-purple-300">
            {nombre}
          </span>
        );
        return <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">{nombre}</span>;
      })}
    </div>
  );
}

// ── Formulario de un ítem ─────────────────────────────────────────────────────
function FormularioItem({ item, vendedores, onChange }: {
  item: ItemCola; vendedores: Vendedor[]; onChange: (c: Partial<ItemCola>) => void;
}) {
  const total = (parseFloat(item._contado) || 0) + (parseFloat(item._credito) || 0);
  const inp = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all";

  return (
    <div className="flex flex-col gap-3">
      {/* Tab tipo */}
      <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 text-xs">
        <button onClick={() => onChange({ _tab: 'facturado' })}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold transition-all ${item._tab === 'facturado' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400'}`}>
          <Building2 className="w-3.5 h-3.5" /> Facturado
        </button>
        <button onClick={() => onChange({ _tab: 'vendido' })}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold transition-all ${item._tab === 'vendido' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
          <FileText className="w-3.5 h-3.5" /> Vendido
        </button>
      </div>

      {/* Vendedor + Fecha */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vendedor *</label>
          <select value={item._vendedorId} onChange={e => onChange({ _vendedorId: e.target.value })} className={`${inp} text-slate-700`}>
            <option value="">Seleccionar...</option>
            {vendedores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
          <input type="date" value={item._fecha} onChange={e => onChange({ _fecha: e.target.value })} className={inp} />
        </div>
      </div>

      {item._tab === 'facturado' && (
        <>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monto (B/.)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
              <input type="number" step="0.01" min="0" value={item._monto} onChange={e => onChange({ _monto: e.target.value })} placeholder="0.00" className={`${inp} pl-9`} />
            </div>
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
                <label className="flex items-center gap-0.5 text-[11px] font-semibold text-slate-600 mb-1"><Ic className="w-3 h-3" /> {label}</label>
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
                <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-1"><Ic className="w-3 h-3 text-slate-400" /> {label}</label>
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
              <span className="text-xs font-semibold text-blue-700">Total</span>
            </div>
            <span className="font-mono text-base font-bold text-blue-700">B/.{fmt2(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AccionesRapidasIA({ vendedores, onSuccess }: AccionesRapidasIAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
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
    setTexto(''); setArchivo(null); setEstado('idle');
    setErrorMsg(''); setResumen(''); setCola([]); setIndexActual(0);
  };

  const handleAnalizar = () => {
    if (!texto.trim() && !archivo) return;
    setEstado('analizando');
    setErrorMsg('');
    startTransition(async () => {
      let base64: string | undefined;
      let mimeT: string | undefined;
      if (archivo) {
        const buf = await archivo.arrayBuffer();
        base64 = Buffer.from(buf).toString('base64');
        mimeT = archivo.type;
      }
      const r = await analizarReporteValisBiz(texto, base64, mimeT);
      if (!r.success || !r.data || r.data.registros.length === 0) {
        setEstado('error');
        setErrorMsg(r.error || 'No se encontraron datos');
        return;
      }
      setCola(r.data.registros.map(d => construirItem(d, vendedores)));
      setResumen(r.data.resumen);
      setIndexActual(0);
      setEstado('cola');
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
      let res;
      if (item._tab === 'facturado') {
        const monto = parseFloat(item._monto);
        if (!monto || monto <= 0) { setErrorMsg('El monto debe ser mayor a 0.'); setEstado('cola'); return; }
        res = await registrarFacturado(item._vendedorId, monto, fecha, item._notas);
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
        else setEstado('exito');
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
      else setEstado('exito');
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
    <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[640px] max-h-[calc(100vh-8rem)] lg:max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-purple-700 to-pink-600 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
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
            <button onClick={resetTodo} className="p-2 hover:bg-white/20 rounded-xl transition-colors" title="Nueva consulta">
              <Bot className="w-4 h-4 text-purple-100" />
            </button>
          )}
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <Minimize2 className="w-5 h-5 text-purple-100" />
          </button>
        </div>
      </div>

      {/* ── Área de contenido ── */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">

        {/* Pantalla inicial con sugerencias */}
        {estado === 'idle' && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
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
                    className="text-left text-xs bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 px-3 py-2.5 rounded-xl transition-colors w-full">
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
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2 text-slate-500">
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
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[90%]">
                <p className="text-xs font-medium text-slate-700 mb-2">{resumen}</p>
                <ChipsProgreso cola={cola} actual={indexActual} />
              </div>
            </div>

            {/* Formulario del registro actual */}
            <div className="flex justify-end">
              <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs font-medium max-w-[85%]">
                Registro {indexActual + 1} de {cola.length} · {itemActual.vendedor_nombre || 'Vendedor'}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
              <FormularioItem item={itemActual} vendedores={vendedores} onChange={updateItem} />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errorMsg}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button onClick={handleOmitir} disabled={estado === 'guardando'}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors">
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
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-slate-800 text-sm">¡Todo procesado!</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  ✅ {guardados} guardados{omitidos > 0 ? ` · ⏭ ${omitidos} omitidos` : ''}
                </p>
                <ChipsProgreso cola={cola} actual={-1} />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={resetTodo}
                className="text-xs text-purple-600 font-semibold hover:underline px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-colors">
                Analizar otro reporte →
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
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
            placeholder="Ej: Andrés: 12 vistas, 9 con compra…"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none min-h-[44px] max-h-32"
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
