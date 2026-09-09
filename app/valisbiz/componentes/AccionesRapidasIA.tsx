'use client';

import { useState, useRef, useTransition } from 'react';
import {
  Sparkles, Send, X, Loader2, CheckCircle2, AlertCircle,
  ImagePlus, Eye, ShoppingCart, XCircle, Banknote, CreditCard,
  Calculator, Building2, FileText, ChevronDown, ChevronRight,
  ChevronLeft, SkipForward, Check, Clock
} from 'lucide-react';
import { analizarReporteValisBiz, type DatosIAVendedor } from '../acciones/ia';
import { registrarVenta, registrarFacturado } from '../acciones/dashboard';

interface Vendedor { id: string; nombre: string; }
interface AccionesRapidasIAProps {
  vendedores: Vendedor[];
  onSuccess: () => void;
}

type EstadoIA = 'idle' | 'analizando' | 'cola' | 'guardando' | 'exito' | 'error';
type EstadoItem = 'pendiente' | 'guardando' | 'guardado' | 'omitido';

interface ItemCola extends DatosIAVendedor {
  _estado: EstadoItem;
  // campos editables pre-rellenados
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
  const vid = buscarVendedor(d.vendedor_nombre, vendedores);
  const today = new Date().toISOString().split('T')[0];
  return {
    ...d,
    _estado: 'pendiente',
    _vendedorId: vid,
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

// ── Indicador de progreso ─────────────────────────────────────────────────────
function IndicadorProgreso({ cola, actual }: { cola: ItemCola[]; actual: number }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {cola.map((item, i) => {
        const nombre = item.vendedor_nombre?.split(' ')[0] || `#${i + 1}`;
        let cls = '';
        let Icono = null;
        if (item._estado === 'guardado') { cls = 'bg-emerald-500 text-white'; Icono = Check; }
        else if (item._estado === 'omitido') { cls = 'bg-slate-300 text-slate-500 line-through'; }
        else if (i === actual) { cls = 'bg-purple-500 text-white ring-2 ring-purple-300'; }
        else { cls = 'bg-slate-100 text-slate-500'; }
        return (
          <div key={i} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${cls}`}>
            {Icono && <Icono className="w-3 h-3" />}
            {nombre}
          </div>
        );
      })}
    </div>
  );
}

// ── Formulario de un ítem ─────────────────────────────────────────────────────
function FormularioItem({
  item, vendedores, onChange
}: {
  item: ItemCola;
  vendedores: Vendedor[];
  onChange: (campos: Partial<ItemCola>) => void;
}) {
  const total = (parseFloat(item._contado) || 0) + (parseFloat(item._credito) || 0);
  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all";

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs tipo */}
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vendedor *</label>
          <select value={item._vendedorId} onChange={e => onChange({ _vendedorId: e.target.value })}
            className={`${inputCls} text-slate-700`}>
            <option value="">Seleccionar...</option>
            {vendedores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha</label>
          <input type="date" value={item._fecha} onChange={e => onChange({ _fecha: e.target.value })} className={inputCls} />
        </div>
      </div>

      {/* ── Facturado ── */}
      {item._tab === 'facturado' && (
        <>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monto (B/.)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
              <input type="number" step="0.01" min="0" value={item._monto}
                onChange={e => onChange({ _monto: e.target.value })} placeholder="0.00"
                className={`${inputCls} pl-9`} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notas</label>
            <input type="text" value={item._notas} onChange={e => onChange({ _notas: e.target.value })}
              placeholder="Opcional" className={inputCls} />
          </div>
        </>
      )}

      {/* ── Vendido ── */}
      {item._tab === 'vendido' && (
        <>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Visitas del día</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Vistas', key: '_vistas', Icon: Eye, cls: inputCls },
                { label: 'Con Compra', key: '_conCompra', Icon: ShoppingCart, cls: "w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" },
                { label: 'Sin Compra', key: '_sinCompra', Icon: XCircle, cls: "w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-300 transition-all" },
              ].map(({ label, key, Icon: Ic, cls }) => (
                <div key={key}>
                  <label className="flex items-center gap-0.5 text-[11px] font-semibold text-slate-600 mb-1">
                    <Ic className="w-3 h-3" /> {label}
                  </label>
                  <input type="number" min="0"
                    value={(item as any)[key]}
                    onChange={e => onChange({ [key]: e.target.value } as any)}
                    className={`${cls} text-center`} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Montos (B/.)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Contado', key: '_contado', Icon: Banknote },
                { label: 'Crédito', key: '_credito', Icon: CreditCard },
              ].map(({ label, key, Icon: Ic }) => (
                <div key={key}>
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-1">
                    <Ic className="w-3 h-3 text-slate-400" /> {label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                    <input type="number" step="0.01" min="0"
                      value={(item as any)[key]}
                      onChange={e => onChange({ [key]: e.target.value } as any)}
                      className={`${inputCls} pl-8`} />
                  </div>
                </div>
              ))}
            </div>
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
  const [expandido, setExpandido] = useState(false);
  const [texto, setTexto] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [estado, setEstado] = useState<EstadoIA>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resumen, setResumen] = useState('');
  const [cola, setCola] = useState<ItemCola[]>([]);
  const [indexActual, setIndexActual] = useState(0);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const resetTodo = () => {
    setTexto(''); setArchivo(null); setEstado('idle');
    setErrorMsg(''); setResumen(''); setCola([]); setIndexActual(0);
  };

  // ── Analizar con IA ────────────────────────────────────────────────────────
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
        setErrorMsg(r.error || 'No se encontraron datos en la imagen');
        return;
      }
      const items = r.data.registros.map(d => construirItem(d, vendedores));
      setCola(items);
      setResumen(r.data.resumen);
      setIndexActual(0);
      setEstado('cola');
    });
  };

  // ── Actualizar campo de un item ────────────────────────────────────────────
  const updateItem = (campos: Partial<ItemCola>) => {
    setCola(prev => prev.map((item, i) => i === indexActual ? { ...item, ...campos } : item));
  };

  // ── Guardar item actual ────────────────────────────────────────────────────
  const handleGuardarActual = () => {
    const item = cola[indexActual];
    if (!item._vendedorId) { setErrorMsg('Selecciona un vendedor.'); return; }
    setErrorMsg('');
    setCola(prev => prev.map((it, i) => i === indexActual ? { ...it, _estado: 'guardando' } : it));
    setEstado('guardando');

    startTransition(async () => {
      let res;
      const fecha = new Date(item._fecha + 'T12:00:00');
      if (item._tab === 'facturado') {
        const monto = parseFloat(item._monto);
        if (!monto || monto <= 0) {
          setErrorMsg('El monto debe ser mayor a 0.');
          setCola(prev => prev.map((it, i) => i === indexActual ? { ...it, _estado: 'pendiente' } : it));
          setEstado('cola');
          return;
        }
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

      if (!res.success) {
        setErrorMsg('Error al guardar: ' + res.error);
        setCola(prev => prev.map((it, i) => i === indexActual ? { ...it, _estado: 'pendiente' } : it));
        setEstado('cola');
        return;
      }

      // Marcar como guardado
      const nuevaCola = cola.map((it, i) => i === indexActual ? { ...it, _estado: 'guardado' as EstadoItem } : it);
      setCola(nuevaCola);
      onSuccess(); // Refresca los datos del mes

      // Ir al siguiente pendiente
      const siguientePendiente = nuevaCola.findIndex((it, i) => i > indexActual && it._estado === 'pendiente');
      if (siguientePendiente !== -1) {
        setIndexActual(siguientePendiente);
        setEstado('cola');
      } else {
        // Verificar si quedan pendientes antes del actual
        const cualquierPendiente = nuevaCola.findIndex(it => it._estado === 'pendiente');
        if (cualquierPendiente !== -1) {
          setIndexActual(cualquierPendiente);
          setEstado('cola');
        } else {
          setEstado('exito');
        }
      }
    });
  };

  // ── Omitir item actual ────────────────────────────────────────────────────
  const handleOmitir = () => {
    const nuevaCola = cola.map((it, i) => i === indexActual ? { ...it, _estado: 'omitido' as EstadoItem } : it);
    setCola(nuevaCola);
    const siguiente = nuevaCola.findIndex((it, i) => i > indexActual && it._estado === 'pendiente');
    if (siguiente !== -1) { setIndexActual(siguiente); }
    else {
      const cualquiera = nuevaCola.findIndex(it => it._estado === 'pendiente');
      if (cualquiera !== -1) setIndexActual(cualquiera);
      else setEstado('exito');
    }
  };

  const itemActual = cola[indexActual];
  const guardados = cola.filter(it => it._estado === 'guardado').length;
  const omitidos = cola.filter(it => it._estado === 'omitido').length;
  const pendientes = cola.filter(it => it._estado === 'pendiente').length;

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/60 to-pink-50/40 overflow-hidden">

      {/* ── Header colapsable ── */}
      <button
        onClick={() => { setExpandido(e => !e); if (!expandido) resetTodo(); }}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-purple-50/70 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-purple-800">Acciones Rápidas · IA Gemini</span>
          <span className="block text-[11px] text-purple-500">Sube una foto del reporte y la IA extrae los 3 vendedores automáticamente</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} />
      </button>

      {expandido && (
        <div className="border-t border-purple-100 px-4 pb-4 flex flex-col gap-3">

          {/* ── IDLE: input de texto e imagen ── */}
          {(estado === 'idle' || estado === 'error') && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="relative">
                <textarea
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalizar(); } }}
                  placeholder={'Escribe en lenguaje natural o sube la foto del reporte diario con los 3 vendedores ↓\n\nEj: "Andrés: 12 vistas, 9 con compra, 1877 contado; Joseph: 12 vistas, 686 contado"'}
                  rows={3}
                  className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none transition-all"
                />
                <button onClick={handleAnalizar} disabled={!texto.trim() && !archivo}
                  className="absolute right-3 bottom-3 w-7 h-7 flex items-center justify-center rounded-lg bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
                  onChange={e => setArchivo(e.target.files?.[0] || null)} />
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 text-xs font-semibold hover:bg-purple-50 transition-colors">
                  <ImagePlus className="w-3.5 h-3.5" />
                  {archivo ? archivo.name.substring(0, 28) + (archivo.name.length > 28 ? '…' : '') : 'Foto del reporte / imagen del Excel'}
                </button>
                {archivo && <button onClick={() => setArchivo(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>}
                <span className="text-[11px] text-slate-400 ml-auto">Enter para analizar</span>
              </div>

              {estado === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{errorMsg}
                </div>
              )}
            </div>
          )}

          {/* ── ANALIZANDO ── */}
          {estado === 'analizando' && (
            <div className="mt-3 flex items-center gap-3 bg-white border border-purple-200 rounded-xl px-4 py-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Gemini analizando imagen...</p>
                <p className="text-[11px] text-slate-400">Extrayendo datos de todos los vendedores presentes</p>
              </div>
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin ml-auto" />
            </div>
          )}

          {/* ── COLA DE REGISTROS ── */}
          {(estado === 'cola' || estado === 'guardando') && itemActual && (
            <div className="mt-2 flex flex-col gap-3">

              {/* Resumen IA */}
              <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5">
                <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-700 font-medium flex-1">{resumen}</p>
                <button onClick={resetTodo} className="text-slate-400 hover:text-slate-600 flex-shrink-0"><X className="w-4 h-4" /></button>
              </div>

              {/* Indicador de progreso (chips por vendedor) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Registro {indexActual + 1} de {cola.length}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ✅ {guardados} guardados · ⏭ {omitidos} omitidos · ⏳ {pendientes} pendientes
                  </span>
                </div>
                <IndicadorProgreso cola={cola} actual={indexActual} />
              </div>

              {/* Formulario del item actual */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <FormularioItem item={itemActual} vendedores={vendedores} onChange={updateItem} />
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{errorMsg}
                </div>
              )}

              {/* Navegación y acciones */}
              <div className="flex items-center gap-2">
                {/* Anterior */}
                <button
                  onClick={() => { const prev = cola.findLastIndex((it, i) => i < indexActual); if (prev !== -1) setIndexActual(prev); }}
                  disabled={indexActual === 0}
                  className="w-8 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Omitir */}
                <button onClick={handleOmitir} disabled={estado === 'guardando'}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors">
                  <SkipForward className="w-3.5 h-3.5" /> Omitir
                </button>

                {/* Guardar */}
                <button onClick={handleGuardarActual}
                  disabled={estado === 'guardando' || !itemActual._vendedorId}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-bold shadow transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {estado === 'guardando'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                    : pendientes > 1
                      ? <><CheckCircle2 className="w-4 h-4" /> Guardar y siguiente</>
                      : <><CheckCircle2 className="w-4 h-4" /> Guardar</>
                  }
                </button>

                {/* Siguiente (saltar sin guardar) */}
                {cola.findIndex((it, i) => i > indexActual && it._estado === 'pendiente') !== -1 && (
                  <button
                    onClick={() => {
                      const sig = cola.findIndex((it, i) => i > indexActual && it._estado === 'pendiente');
                      if (sig !== -1) setIndexActual(sig);
                    }}
                    className="w-8 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── ÉXITO TOTAL ── */}
          {estado === 'exito' && (
            <div className="mt-3 flex flex-col gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 flex flex-col items-center gap-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <p className="font-bold text-emerald-800">¡Todo procesado!</p>
                <p className="text-sm text-emerald-600">
                  ✅ {guardados} guardados {omitidos > 0 && `· ⏭ ${omitidos} omitidos`}
                </p>
                <IndicadorProgreso cola={cola} actual={-1} />
              </div>
              <button onClick={resetTodo}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
                Analizar otro reporte
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
