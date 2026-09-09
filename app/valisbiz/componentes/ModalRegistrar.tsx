'use client';

import { useState, useTransition, useEffect } from 'react';
import { X, Building2, FileText, Eye, ShoppingCart, XCircle, CreditCard, Banknote, Calculator } from 'lucide-react';
import { registrarFacturado, registrarVenta } from '../acciones/dashboard';

interface Vendedor {
  id: string;
  nombre: string;
}

interface ModalRegistrarProps {
  vendedores: Vendedor[];
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'facturado' | 'vendido';

export default function ModalRegistrar({ vendedores, onClose, onSuccess }: ModalRegistrarProps) {
  const [tab, setTab] = useState<TabType>('facturado');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Campos comunes
  const [vendedorId, setVendedorId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Campos Facturado
  const [montoFacturado, setMontoFacturado] = useState('');
  const [notas, setNotas] = useState('');

  // Campos Vendido (Vendedor) — nuevos campos diarios
  const [vistas, setVistas] = useState('');
  const [conCompra, setConCompra] = useState('');
  const [sinCompra, setSinCompra] = useState('');
  const [contado, setContado] = useState('');
  const [credito, setCredito] = useState('');

  // Total calculado automáticamente
  const totalCalculado = (parseFloat(contado) || 0) + (parseFloat(credito) || 0);

  const reset = () => {
    setVendedorId('');
    setFecha(new Date().toISOString().split('T')[0]);
    setMontoFacturado('');
    setNotas('');
    setVistas('');
    setConCompra('');
    setSinCompra('');
    setContado('');
    setCredito('');
    setError('');
    setSuccess('');
  };

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!vendedorId || !fecha) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (tab === 'facturado') {
      const montoNum = parseFloat(montoFacturado);
      if (!montoFacturado || isNaN(montoNum) || montoNum <= 0) {
        setError('El monto debe ser un número mayor a cero.');
        return;
      }
      startTransition(async () => {
        const result = await registrarFacturado(vendedorId, montoNum, new Date(fecha + 'T12:00:00'), notas);
        if (result.success) {
          setSuccess('✅ Facturación registrada correctamente.');
          reset();
          setTimeout(() => onSuccess(), 1200);
        } else {
          setError('Error al guardar: ' + result.error);
        }
      });
    } else {
      // Vendido (Vendedor)
      if (totalCalculado <= 0 && !contado && !credito) {
        setError('Ingresa al menos el monto de Contado o Crédito.');
        return;
      }
      startTransition(async () => {
        const result = await registrarVenta(
          vendedorId,
          totalCalculado,
          undefined,
          new Date(fecha + 'T12:00:00'),
          {
            vistas: parseInt(vistas) || 0,
            con_compra: parseInt(conCompra) || 0,
            sin_compra: parseInt(sinCompra) || 0,
            contado: parseFloat(contado) || 0,
            credito: parseFloat(credito) || 0,
          }
        );
        if (result.success) {
          setSuccess('✅ Reporte diario del vendedor guardado.');
          reset();
          setTimeout(() => onSuccess(), 1200);
        } else {
          setError('Error al guardar: ' + result.error);
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Registrar Datos</h2>
            <p className="text-pink-100 text-xs mt-0.5">Selecciona el tipo de registro a ingresar</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <button
            onClick={() => handleTabChange('facturado')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${tab === 'facturado' ? 'border-pink-500 text-pink-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Building2 className="w-4 h-4" />
            Facturado (Finanzas)
          </button>
          <button
            onClick={() => handleTabChange('vendido')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all border-b-2 ${tab === 'vendido' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" />
            Vendido (Vendedor)
          </button>
        </div>

        {/* Context note */}
        <div className={`px-6 py-2.5 text-[11px] font-medium flex-shrink-0 ${tab === 'facturado' ? 'bg-pink-50 text-pink-700 border-b border-pink-100' : 'bg-blue-50 text-blue-700 border-b border-blue-100'}`}>
          {tab === 'facturado'
            ? '📊 Ingresa el acumulado que Finanzas reporta. Se guardará el monto del día.'
            : '📋 Informe diario del vendedor: visitas, compras y montos. El Total = Contado + Crédito.'}
        </div>

        {/* Form — scrollable */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

            {/* Vendedor */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vendedor *</label>
              <select
                value={vendedorId}
                onChange={e => setVendedorId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
              >
                <option value="">Seleccionar vendedor...</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Fecha del reporte *
                {tab === 'facturado' && <span className="text-slate-400 font-normal ml-1">(fecha en que finanzas reporta)</span>}
              </label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
              />
            </div>

            {/* ── FACTURADO ── */}
            {tab === 'facturado' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Monto Facturado (B/.) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">B/.</span>
                    <input
                      type="number" step="0.01" min="0"
                      value={montoFacturado}
                      onChange={e => setMontoFacturado(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notas (opcional)</label>
                  <input
                    type="text"
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder="Ej: Reporte finanzas 09/09/2026"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all"
                  />
                </div>
              </>
            )}

            {/* ── VENDIDO (VENDEDOR) — CAMPOS NUEVOS ── */}
            {tab === 'vendido' && (
              <>
                {/* Sección: Visitas */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Visitas del día</p>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Vistas */}
                    <div>
                      <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" /> Vistas
                      </label>
                      <input
                        type="number" min="0" step="1"
                        value={vistas}
                        onChange={e => setVistas(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                      />
                    </div>
                    {/* Con Compra */}
                    <div>
                      <label className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mb-1.5">
                        <ShoppingCart className="w-3.5 h-3.5" /> Con Compra
                      </label>
                      <input
                        type="number" min="0" step="1"
                        value={conCompra}
                        onChange={e => setConCompra(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 font-mono text-center focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all"
                      />
                    </div>
                    {/* Sin Compra */}
                    <div>
                      <label className="flex items-center gap-1 text-xs font-semibold text-red-600 mb-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Sin Compra
                      </label>
                      <input
                        type="number" min="0" step="1"
                        value={sinCompra}
                        onChange={e => setSinCompra(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Montos */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Montos del día (B/.)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Contado */}
                    <div>
                      <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1.5">
                        <Banknote className="w-3.5 h-3.5 text-slate-400" /> Contado
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                        <input
                          type="number" step="0.01" min="0"
                          value={contado}
                          onChange={e => setContado(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                        />
                      </div>
                    </div>
                    {/* Crédito */}
                    <div>
                      <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Crédito
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">B/.</span>
                        <input
                          type="number" step="0.01" min="0"
                          value={credito}
                          onChange={e => setCredito(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total calculado */}
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700">Total del día</span>
                    <span className="text-[11px] text-blue-400">(Contado + Crédito)</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-blue-700">
                    B/.{totalCalculado.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}

            {/* Feedback */}
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2">{success}</p>}

            {/* Actions */}
            <div className="flex gap-3 pt-1 pb-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all disabled:opacity-60 ${tab === 'facturado' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isPending ? 'Guardando...' : 'Guardar Registro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
