'use client';

import { useState, useTransition } from 'react';
import { X, MapPin } from 'lucide-react';
import type { Local, CadenaLocal } from '@/types/valisbiz';
import { crearLocal, editarLocal } from '../acciones/crm';

interface ModalLocalProps {
  onClose: () => void;
  localAEditar?: Local | null;
}

export default function ModalLocal({ onClose, localAEditar }: ModalLocalProps) {
  const isEditing = !!localAEditar;
  
  const [nombre, setNombre] = useState(localAEditar?.nombre_local || '');
  const [cadena, setCadena] = useState<CadenaLocal>((localAEditar?.cadena as CadenaLocal) || 'Otro');
  const [latitud, setLatitud] = useState(localAEditar?.latitud?.toString() || '');
  const [longitud, setLongitud] = useState(localAEditar?.longitud?.toString() || '');
  const [direccion, setDireccion] = useState(localAEditar?.direccion || '');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !cadena || !latitud || !longitud) return;
    
    startTransition(async () => {
      const data = {
        nombre_local: nombre,
        cadena: cadena as any,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        direccion: direccion || null
      };

      if (isEditing && localAEditar) {
        await editarLocal(localAEditar.id, data);
      } else {
        await crearLocal(data);
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg">{isEditing ? 'Editar Local' : 'Nuevo Local'}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Nombre de la Sucursal</label>
            <input 
              required
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Super 99 Valle Hermoso"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Cadena</label>
            <select 
              required
              value={cadena}
              onChange={e => setCadena(e.target.value as CadenaLocal)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              <option value="Rey">Rey</option>
              <option value="Super 99">Super 99</option>
              <option value="Riba Smith">Riba Smith</option>
              <option value="Mr. Precio">Mr. Precio</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-600">Latitud</label>
              <input 
                required
                type="number"
                step="any"
                value={latitud}
                onChange={e => setLatitud(e.target.value)}
                placeholder="8.9052"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-600">Longitud</label>
              <input 
                required
                type="number"
                step="any"
                value={longitud}
                onChange={e => setLongitud(e.target.value)}
                placeholder="-79.7314"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-600">Dirección / Zona (Opcional)</label>
            <input 
              type="text"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              placeholder="Ej. Nuevo Arraiján"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="mt-4">
            <button 
              type="submit"
              disabled={isPending || !nombre || !latitud || !longitud}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              {isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isEditing ? 'Guardar Cambios' : 'Añadir Local')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
