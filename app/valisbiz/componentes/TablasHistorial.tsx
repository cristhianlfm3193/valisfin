'use client';

import { useState, useMemo, useTransition, Fragment } from 'react';
import { Search, ChevronLeft, ChevronRight, Building2, FileText, Pencil, Trash2, X, Loader2, AlertTriangle, Eye, ShoppingCart, XCircle, Banknote, CreditCard, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  editarFacturado, borrarFacturado,
  editarVendido, borrarVendido,
} from '../acciones/dashboard';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface RegistroFacturadoFila {
  id: string;
  vendedor_nombre: string;
  fecha: string;
  monto: number;
  notas?: string | null;
}

interface RegistroVendidoFila {
  id: string;
  vendedor_nombre: string;
  fecha: string;
  monto: number;
  vistas: number;
  con_compra: number;
  sin_compra: number;
  contado: number;
  credito: number;
}

const PAGE_SIZE = 5;

function fmt(n: number) {
  return n.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Modal Confirmar Borrado ───────────────────────────────────────────────────
function ModalConfirmarBorrado({
  mensaje, onConfirm, onCancel, isPending,
}: { mensaje: string; onConfirm: () => void; onCancel: () => void; isPending: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Confirmar borrado</h3>
            <p className="text-sm text-slate-500 mt-0.5">{mensaje}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Editar Facturado ───────────────────────────────────────────────────
function ModalEditarFacturado({
  registro, onClose, onSuccess,
}: { registro: RegistroFacturadoFila; onClose: () => void; onSuccess: () => void }) {
  const [monto, setMonto] = useState(registro.monto.toString());
  const [fecha, setFecha] = useState(registro.fecha);
  const [notas, setNotas] = useState(registro.notas || '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) { setError('El monto debe ser mayor a cero.'); return; }
    startTransition(async () => {
      const r = await editarFacturado(registro.id, montoNum, fecha, notas);
      if (r.success) onSuccess();
      else setError('Error: ' + r.error);
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold">Editar Facturado</h3>
            <p className="text-pink-100 text-xs mt-0.5">{registro.vendedor_nombre}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Monto Facturado (B/.)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">B/.</span>
              <input type="number" step="0.01" min="0" value={monto} onChange={e => setMonto(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notas</label>
            <input type="text" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Opcional"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold shadow transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Editar Vendido ─────────────────────────────────────────────────────
function ModalEditarVendido({
  registro, onClose, onSuccess,
}: { registro: RegistroVendidoFila; onClose: () => void; onSuccess: () => void }) {
  const [fecha, setFecha] = useState(registro.fecha);
  const [vistas, setVistas] = useState(registro.vistas.toString());
  const [conCompra, setConCompra] = useState(registro.con_compra.toString());
  const [sinCompra, setSinCompra] = useState(registro.sin_compra.toString());
  const [contado, setContado] = useState(registro.contado.toString());
  const [credito, setCredito] = useState(registro.credito.toString());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const total = (parseFloat(contado) || 0) + (parseFloat(credito) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const r = await editarVendido(registro.id, {
        fecha,
        vistas: parseInt(vistas) || 0,
        con_compra: parseInt(conCompra) || 0,
        sin_compra: parseInt(sinCompra) || 0,
        contado: parseFloat(contado) || 0,
        credito: parseFloat(credito) || 0,
      });
      if (r.success) onSuccess();
      else setError('Error: ' + r.error);
    });
  };

  const inputBase = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-white font-bold">Editar Reporte Vendedor</h3>
            <p className="text-blue-100 text-xs mt-0.5">{registro.vendedor_nombre}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" />
            </div>

            {/* Visitas */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Visitas del día</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-400" /> Vistas
                  </label>
                  <input type="number" min="0" value={vistas} onChange={e => setVistas(e.target.value)} placeholder="0" className={inputBase} />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mb-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" /> Con Compra
                  </label>
                  <input type="number" min="0" value={conCompra} onChange={e => setConCompra(e.target.value)} placeholder="0"
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-red-600 mb-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Sin Compra
                  </label>
                  <input type="number" min="0" value={sinCompra} onChange={e => setSinCompra(e.target.value)} placeholder="0"
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-300 transition-all" />
                </div>
              </div>
            </div>

            {/* Montos */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Montos (B/.)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1.5">
                    <Banknote className="w-3.5 h-3.5 text-slate-400" /> Contado
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                    <input type="number" step="0.01" min="0" value={contado} onChange={e => setContado(e.target.value)} placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Crédito
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                    <input type="number" step="0.01" min="0" value={credito} onChange={e => setCredito(e.target.value)} placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700">Total</span>
              </div>
              <span className="font-mono text-lg font-bold text-blue-700">
                B/.{total.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
            <div className="flex gap-3 pb-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


// ─── Helper: columna sorteable ─────────────────────────────────────────────────
type SortDir = 'asc' | 'desc';
function SortTh({ label, col, sort, dir, onSort, className = '' }: {
  label: string; col: string; sort: string; dir: SortDir;
  onSort: (col: string) => void; className?: string;
}) {
  const active = sort === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={`py-2.5 px-3 select-none cursor-pointer hover:text-slate-700 transition-colors whitespace-nowrap group ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`text-[10px] transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
          {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  );
}

// ─── Tabla Facturado ───────────────────────────────────────────────────────────
function TablaFacturado({ registros, onRefresh }: { registros: RegistroFacturadoFila[]; onRefresh: () => void }) {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<RegistroFacturadoFila | null>(null);
  const [borrando, setBorrando] = useState<RegistroFacturadoFila | null>(null);
  const [isPendingBorrar, startBorrar] = useTransition();
  const [sortCol, setSortCol] = useState<string>('fecha');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [verTodos, setVerTodos] = useState(false);

  const handleSort = (col: string) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'fecha' ? 'desc' : 'desc'); }
    setPagina(1);
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    const base = !q ? registros : registros.filter(r =>
      r.vendedor_nombre.toLowerCase().includes(q) ||
      r.fecha.includes(q) ||
      (r.notas && r.notas.toLowerCase().includes(q))
    );
    return [...base].sort((a, b) => {
      let v = 0;
      if (sortCol === 'fecha') v = a.fecha.localeCompare(b.fecha);
      else if (sortCol === 'vendedor') v = a.vendedor_nombre.localeCompare(b.vendedor_nombre);
      else if (sortCol === 'monto') v = a.monto - b.monto;
      return sortDir === 'asc' ? v : -v;
    });
  }, [registros, busqueda, sortCol, sortDir]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const filas = verTodos ? filtrados : filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);
  const totalMonto = filtrados.reduce((acc, r) => acc + r.monto, 0);

  const handleBorrar = () => {
    if (!borrando) return;
    startBorrar(async () => {
      await borrarFacturado(borrando.id);
      setBorrando(null);
      onRefresh();
    });
  };

  return (
    <>
      {editando && (
        <ModalEditarFacturado
          registro={editando}
          onClose={() => setEditando(null)}
          onSuccess={() => { setEditando(null); onRefresh(); }}
        />
      )}
      {borrando && (
        <ModalConfirmarBorrado
          mensaje={`¿Borrar el registro de B/.${fmt(borrando.monto)} de ${borrando.vendedor_nombre}?`}
          onConfirm={handleBorrar}
          onCancel={() => setBorrando(null)}
          isPending={isPendingBorrar}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-pink-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Facturado por Finanzas</h4>
              <p className="text-[11px] text-slate-400">Snapshot diario · muestra el último registro por vendedor en la tabla comparativa</p>
            </div>
          </div>
          <div className="font-mono text-sm font-bold text-pink-600 whitespace-nowrap flex items-center gap-3">
            Total: B/.{fmt(totalMonto)}
            <button
              onClick={() => setVerTodos(v => !v)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                verTodos
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-white text-pink-600 border-pink-300 hover:bg-pink-50'
              }`}
            >
              {verTodos ? 'Paginar' : `Ver todos (${filtrados.length})`}
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar por vendedor, fecha o notas..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all" />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <SortTh label="Fecha" col="fecha" sort={sortCol} dir={sortDir} onSort={handleSort} />
                <SortTh label="Vendedor" col="vendedor" sort={sortCol} dir={sortDir} onSort={handleSort} />
                <SortTh label="Facturado" col="monto" sort={sortCol} dir={sortDir} onSort={handleSort} className="text-right" />
                <th className="py-2.5 px-3">Notas</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                    {busqueda ? 'No hay resultados para tu búsqueda.' : 'No hay registros para este mes.'}
                  </td>
                </tr>
              ) : (
                filas.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-4 text-sm font-mono text-slate-600 whitespace-nowrap">
                      {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-pink-100 text-pink-700">{r.vendedor_nombre.split(' ')[0]}</span>
                      <span className="text-sm text-slate-700 ml-2">{r.vendedor_nombre}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm font-bold text-pink-600">B/.{fmt(r.monto)}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 max-w-[180px] truncate">{r.notas || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditando(r)}
                          title="Editar"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-600 text-slate-500 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBorrando(r)}
                          title="Borrar"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!verTodos && <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} total={filtrados.length} pageSize={PAGE_SIZE} setPagina={setPagina} color="pink" />}
      </div>
    </>
  );
}

// ─── Tabla Vendido ─────────────────────────────────────────────────────────────
function TablaVendido({ registros, onRefresh }: { registros: RegistroVendidoFila[]; onRefresh: () => void }) {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<RegistroVendidoFila | null>(null);
  const [borrando, setBorrando] = useState<RegistroVendidoFila | null>(null);
  const [isPendingBorrar, startBorrar] = useTransition();
  const [sortCol, setSortCol] = useState<string>('fecha');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [verTodos, setVerTodos] = useState(false);

  const handleSort = (col: string) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
    setPagina(1);
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    const base = !q ? registros : registros.filter(r =>
      r.vendedor_nombre.toLowerCase().includes(q) || r.fecha.includes(q)
    );
    return [...base].sort((a, b) => {
      let v = 0;
      if (sortCol === 'fecha') v = a.fecha.localeCompare(b.fecha);
      else if (sortCol === 'vendedor') v = a.vendedor_nombre.localeCompare(b.vendedor_nombre);
      else if (sortCol === 'vistas') v = a.vistas - b.vistas;
      else if (sortCol === 'con_compra') v = a.con_compra - b.con_compra;
      else if (sortCol === 'sin_compra') v = a.sin_compra - b.sin_compra;
      else if (sortCol === 'contado') v = a.contado - b.contado;
      else if (sortCol === 'credito') v = a.credito - b.credito;
      else if (sortCol === 'total') v = a.monto - b.monto;
      return sortDir === 'asc' ? v : -v;
    });
  }, [registros, busqueda, sortCol, sortDir]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const filas = verTodos ? filtrados : filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);
  const totalMonto = filtrados.reduce((acc, r) => acc + r.monto, 0);
  const totalVistas = filtrados.reduce((acc, r) => acc + r.vistas, 0);
  const totalConCompra = filtrados.reduce((acc, r) => acc + r.con_compra, 0);
  const totalSinCompra = filtrados.reduce((acc, r) => acc + r.sin_compra, 0);
  const totalContado = filtrados.reduce((acc, r) => acc + r.contado, 0);
  const totalCredito = filtrados.reduce((acc, r) => acc + r.credito, 0);

  const handleBorrar = () => {
    if (!borrando) return;
    startBorrar(async () => {
      await borrarVendido(borrando.id);
      setBorrando(null);
      onRefresh();
    });
  };

  return (
    <>
      {editando && (
        <ModalEditarVendido
          registro={editando}
          onClose={() => setEditando(null)}
          onSuccess={() => { setEditando(null); onRefresh(); }}
        />
      )}
      {borrando && (
        <ModalConfirmarBorrado
          mensaje={`¿Borrar el reporte de ${borrando.vendedor_nombre} del ${new Date(borrando.fecha + 'T12:00:00').toLocaleDateString('es-PA', { day: '2-digit', month: 'short' })}?`}
          onConfirm={handleBorrar}
          onCancel={() => setBorrando(null)}
          isPending={isPendingBorrar}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Vendido Reportado por Vendedores</h4>
              <p className="text-[11px] text-slate-400">Acumulado diario del vendedor · se suma al mes en la tabla comparativa</p>
            </div>
          </div>
          <div className="font-mono text-sm font-bold text-blue-600 whitespace-nowrap flex items-center gap-3">
            Total: B/.{fmt(totalMonto)}
            <button
              onClick={() => setVerTodos(v => !v)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                verTodos
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
              }`}
            >
              {verTodos ? `Paginar` : `Ver todos (${filtrados.length})`}
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder="Buscar por vendedor o fecha..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <SortTh label="Fecha" col="fecha" sort={sortCol} dir={sortDir} onSort={handleSort} />
                <SortTh label="Vendedor" col="vendedor" sort={sortCol} dir={sortDir} onSort={handleSort} />
                <SortTh label="Vistas" col="vistas" sort={sortCol} dir={sortDir} onSort={handleSort} className="text-center" />
                <SortTh label="Con Compra" col="con_compra" sort={sortCol} dir={sortDir} onSort={handleSort} className="text-center text-emerald-600" />
                <SortTh label="Sin Compra" col="sin_compra" sort={sortCol} dir={sortDir} onSort={handleSort} className="text-center text-red-500" />
                <SortTh label="Contado" col="contado" sort={sortCol} dir={sortDir} onSort={handleSort} className="text-right" />
                <SortTh label="Crédito" col="credito" sort={sortCol} dir={sortDir} onSort={handleSort} className="text-right" />
                <SortTh label="Total" col="total" sort={sortCol} dir={sortDir} onSort={handleSort} className="text-right font-bold text-blue-600" />
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-slate-400">
                    {busqueda ? 'No hay resultados.' : 'No hay registros para este mes.'}
                  </td>
                </tr>
              ) : (
                filas.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-3 text-xs font-mono text-slate-600 whitespace-nowrap">
                      {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-PA', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">{r.vendedor_nombre.split(' ')[0]}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-sm text-slate-600">{r.vistas}</td>
                    <td className="py-3 px-3 text-center font-mono text-sm font-semibold text-emerald-600">{r.con_compra}</td>
                    <td className="py-3 px-3 text-center font-mono text-sm font-semibold text-red-500">{r.sin_compra}</td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-slate-600">B/.{fmt(r.contado)}</td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-slate-600">B/.{fmt(r.credito)}</td>
                    <td className="py-3 px-3 text-right font-mono text-sm font-bold text-blue-600">B/.{fmt(r.monto)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditando(r)}
                          title="Editar"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-600 text-slate-500 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBorrando(r)}
                          title="Borrar"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtrados.length > 0 && (
              <tfoot>
                <tr className="bg-blue-50 border-t-2 border-blue-200 text-[11px] font-bold">
                  <td className="py-2.5 px-3 text-slate-600 uppercase tracking-wider" colSpan={2}>Totales del período</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">{totalVistas}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-emerald-700">{totalConCompra}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-red-600">{totalSinCompra}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">B/.{fmt(totalContado)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">B/.{fmt(totalCredito)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-700">B/.{fmt(totalMonto)}</td>
                  <td className="py-2.5 px-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {!verTodos && <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} total={filtrados.length} pageSize={PAGE_SIZE} setPagina={setPagina} color="blue" />}
      </div>
    </>
  );
}

// ─── Paginación reutilizable ──────────────────────────────────────────────────
function Paginacion({ pagina, totalPaginas, total, pageSize, setPagina, color }: {
  pagina: number; totalPaginas: number; total: number; pageSize: number;
  setPagina: (fn: (p: number) => number) => void; color: 'pink' | 'blue';
}) {
  const active = color === 'pink' ? 'bg-pink-500 text-white' : 'bg-blue-500 text-white';
  return (
    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
      <span className="text-xs text-slate-400 font-mono">
        {total === 0 ? '0 registros' : `${(pagina - 1) * pageSize + 1}–${Math.min(pagina * pageSize, total)} de ${total}`}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
          .map((p, i, arr) => (
            <Fragment key={p}>
              {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300 text-xs px-1">…</span>}
              <button
                onClick={() => setPagina(() => p)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-colors ${p === pagina ? active : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                {p}
              </button>
            </Fragment>
          ))}
        <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface TablasHistorialProps {
  registrosFacturado: RegistroFacturadoFila[];
  registrosVendido: RegistroVendidoFila[];
}

export default function TablasHistorial({ registrosFacturado, registrosVendido }: TablasHistorialProps) {
  const router = useRouter();
  const handleRefresh = () => router.refresh();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-slate-800 mt-2">Historial de Registros del Mes</h3>
      <TablaFacturado registros={registrosFacturado} onRefresh={handleRefresh} />
      <TablaVendido registros={registrosVendido} onRefresh={handleRefresh} />
    </div>
  );
}
