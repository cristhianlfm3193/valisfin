'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Building2, FileText } from 'lucide-react';

interface RegistroFila {
  id: string;
  vendedor_nombre: string;
  fecha: string;
  monto: number;
  notas?: string | null;
}

interface TablaHistorialProps {
  titulo: string;
  tipo: 'facturado' | 'vendido';
  registros: RegistroFila[];
}

const PAGE_SIZE = 5;

function fmt(n: number) {
  return n.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TablaHistorial({ titulo, tipo, registros }: TablaHistorialProps) {
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

  const isFacturado = tipo === 'facturado';
  const colorAccent = isFacturado ? 'text-pink-600' : 'text-blue-600';
  const colorBadge = isFacturado ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700';
  const colorBorder = isFacturado ? 'border-pink-200' : 'border-blue-200';
  const Icon = isFacturado ? Building2 : FileText;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${colorBorder} overflow-hidden`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${colorBorder} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${isFacturado ? 'bg-pink-100' : 'bg-blue-100'} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${colorAccent}`} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{titulo}</h4>
            <p className="text-[11px] text-slate-400">
              {isFacturado ? 'Snapshot diario de Finanzas · muestra el último registro por vendedor en la tabla comparativa' : 'Acumulado diario del vendedor · se suma al mes en la tabla comparativa'}
            </p>
          </div>
        </div>
        <div className={`font-mono text-sm font-bold ${colorAccent} whitespace-nowrap`}>
          Total: B/.{fmt(totalMonto)}
        </div>
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
              <th className="py-2.5 px-4 text-right">{isFacturado ? 'Facturado' : 'Vendido'}</th>
              {isFacturado && <th className="py-2.5 px-4">Notas</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={isFacturado ? 4 : 3} className="py-8 text-center text-sm text-slate-400">
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
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${colorBadge}`}>
                      {r.vendedor_nombre.split(' ')[0]}
                    </span>
                    <span className="text-sm text-slate-700 ml-2">{r.vendedor_nombre}</span>
                  </td>
                  <td className={`py-3 px-4 text-right font-mono text-sm font-bold ${colorAccent}`}>
                    B/.{fmt(r.monto)}
                  </td>
                  {isFacturado && (
                    <td className="py-3 px-4 text-xs text-slate-400 max-w-[180px] truncate">
                      {r.notas || '—'}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 font-mono">
          {filtrados.length === 0 ? '0 registros' : `${(paginaActual - 1) * PAGE_SIZE + 1}–${Math.min(paginaActual * PAGE_SIZE, filtrados.length)} de ${filtrados.length}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPaginas || Math.abs(p - paginaActual) <= 1)
            .map((p, i, arr) => (
              <>
                {i > 0 && arr[i - 1] !== p - 1 && <span key={`dots-${p}`} className="text-slate-300 text-xs px-1">…</span>}
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-colors ${p === paginaActual ? (isFacturado ? 'bg-pink-500 text-white' : 'bg-blue-500 text-white') : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {p}
                </button>
              </>
            ))}
          <button
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TablasHistorialProps {
  registrosFacturado: RegistroFila[];
  registrosVendido: RegistroFila[];
}

export default function TablasHistorial({ registrosFacturado, registrosVendido }: TablasHistorialProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-slate-800 mt-2">Historial de Registros del Mes</h3>
      <TablaHistorial
        titulo="Facturado por Finanzas"
        tipo="facturado"
        registros={registrosFacturado}
      />
      <TablaHistorial
        titulo="Vendido Reportado por Vendedores"
        tipo="vendido"
        registros={registrosVendido}
      />
    </div>
  );
}
