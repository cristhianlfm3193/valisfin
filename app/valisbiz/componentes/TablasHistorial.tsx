'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Building2, FileText } from 'lucide-react';

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

// ─── Tabla Facturado ───────────────────────────────────────────────────────────
function TablaFacturado({ registros }: { registros: RegistroFacturadoFila[] }) {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return registros;
    return registros.filter(r =>
      r.vendedor_nombre.toLowerCase().includes(q) ||
      r.fecha.includes(q) ||
      (r.notas && r.notas.toLowerCase().includes(q))
    );
  }, [registros, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const filas = filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);
  const totalMonto = filtrados.reduce((acc, r) => acc + r.monto, 0);

  return (
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
        <div className="font-mono text-sm font-bold text-pink-600 whitespace-nowrap">Total: B/.{fmt(totalMonto)}</div>
      </div>

      {/* Buscador */}
      <div className="px-5 py-3 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar por vendedor, fecha o notas..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-4">Fecha</th>
              <th className="py-2.5 px-4">Vendedor</th>
              <th className="py-2.5 px-4 text-right">Facturado</th>
              <th className="py-2.5 px-4">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-slate-400">
                  {busqueda ? 'No hay resultados para tu búsqueda.' : 'No hay registros para este mes.'}
                </td>
              </tr>
            ) : (
              filas.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-slate-600 whitespace-nowrap">
                    {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-pink-100 text-pink-700">{r.vendedor_nombre.split(' ')[0]}</span>
                    <span className="text-sm text-slate-700 ml-2">{r.vendedor_nombre}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm font-bold text-pink-600">B/.{fmt(r.monto)}</td>
                  <td className="py-3 px-4 text-xs text-slate-400 max-w-[180px] truncate">{r.notas || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} total={filtrados.length} pageSize={PAGE_SIZE} setPagina={setPagina} color="pink" />
    </div>
  );
}

// ─── Tabla Vendido (Vendedor) — con nuevos campos ─────────────────────────────
function TablaVendido({ registros }: { registros: RegistroVendidoFila[] }) {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return registros;
    return registros.filter(r =>
      r.vendedor_nombre.toLowerCase().includes(q) ||
      r.fecha.includes(q)
    );
  }, [registros, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const filas = filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);
  const totalMonto = filtrados.reduce((acc, r) => acc + r.monto, 0);
  const totalVistas = filtrados.reduce((acc, r) => acc + r.vistas, 0);
  const totalConCompra = filtrados.reduce((acc, r) => acc + r.con_compra, 0);
  const totalSinCompra = filtrados.reduce((acc, r) => acc + r.sin_compra, 0);
  const totalContado = filtrados.reduce((acc, r) => acc + r.contado, 0);
  const totalCredito = filtrados.reduce((acc, r) => acc + r.credito, 0);

  return (
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
        <div className="font-mono text-sm font-bold text-blue-600 whitespace-nowrap">Total: B/.{fmt(totalMonto)}</div>
      </div>

      {/* Buscador */}
      <div className="px-5 py-3 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder="Buscar por vendedor o fecha..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-3 whitespace-nowrap">Fecha</th>
              <th className="py-2.5 px-3">Vendedor</th>
              <th className="py-2.5 px-3 text-center">Vistas</th>
              <th className="py-2.5 px-3 text-center text-emerald-600">Con Compra</th>
              <th className="py-2.5 px-3 text-center text-red-500">Sin Compra</th>
              <th className="py-2.5 px-3 text-right">Contado</th>
              <th className="py-2.5 px-3 text-right">Crédito</th>
              <th className="py-2.5 px-3 text-right font-bold text-blue-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                  {busqueda ? 'No hay resultados para tu búsqueda.' : 'No hay registros para este mes.'}
                </td>
              </tr>
            ) : (
              filas.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-xs font-mono text-slate-600 whitespace-nowrap">
                    {new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-PA', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">{r.vendedor_nombre.split(' ')[0]}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-sm text-slate-600">{r.vistas}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-sm font-semibold text-emerald-600">{r.con_compra}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-sm font-semibold text-red-500">{r.sin_compra}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-slate-600">B/.{fmt(r.contado)}</td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-slate-600">B/.{fmt(r.credito)}</td>
                  <td className="py-3 px-3 text-right font-mono text-sm font-bold text-blue-600">B/.{fmt(r.monto)}</td>
                </tr>
              ))
            )}
          </tbody>
          {/* Totales del período filtrado */}
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
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Paginación */}
      <Paginacion pagina={paginaActual} totalPaginas={totalPaginas} total={filtrados.length} pageSize={PAGE_SIZE} setPagina={setPagina} color="blue" />
    </div>
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
        <button
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
          .map((p, i, arr) => (
            <>
              {i > 0 && arr[i - 1] !== p - 1 && <span key={`dots-${p}`} className="text-slate-300 text-xs px-1">…</span>}
              <button
                key={p}
                onClick={() => setPagina(() => p)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-colors ${p === pagina ? active : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            </>
          ))}
        <button
          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
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
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-slate-800 mt-2">Historial de Registros del Mes</h3>
      <TablaFacturado registros={registrosFacturado} />
      <TablaVendido registros={registrosVendido} />
    </div>
  );
}
