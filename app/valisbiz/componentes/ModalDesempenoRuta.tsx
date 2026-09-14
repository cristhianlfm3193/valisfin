import React from 'react';
import { X, MapPin, Route } from 'lucide-react';

interface Props {
  onClose: () => void;
  vendedores: any[];
  rutaVendedor: string;
  setRutaVendedor: (v: string) => void;
  rutaFecha: string;
  setRutaFecha: (v: string) => void;
  calcularRuta: () => void;
  isCalculandoRuta: boolean;
}

export default function ModalDesempenoRuta({
  onClose, vendedores, rutaVendedor, setRutaVendedor, rutaFecha, setRutaFecha, calcularRuta, isCalculandoRuta
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090a0f]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121c27] rounded-2xl p-6 shadow-xl border border-white/10 w-full max-w-lg relative flex flex-col gap-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div>
          <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2 mb-2">
            <Route className="w-5 h-5 text-indigo-400" />
            Desempeño de Ruta
          </h3>
          <p className="text-sm text-slate-400">Visualiza el recorrido exacto por las calles en un día.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col flex-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Vendedor</label>
            <select 
              className="bg-white/5 border border-white/10 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors w-full appearance-none"
              value={rutaVendedor}
              onChange={e => setRutaVendedor(e.target.value)}
            >
              <option value="">Seleccione Vendedor</option>
              {vendedores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col flex-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Día Específico</label>
            <input 
              type="date"
              value={rutaFecha}
              onChange={e => setRutaFecha(e.target.value)}
              className="bg-white/5 border border-white/10 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-col w-full mt-2">
          <button 
            onClick={() => { calcularRuta(); onClose(); }}
            disabled={isCalculandoRuta || !rutaVendedor}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:text-slate-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group"
          >
            {isCalculandoRuta ? (
              <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></span>
            ) : (
              <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            Trazar Ruta
          </button>
        </div>

      </div>
    </div>
  );
}
