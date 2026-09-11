'use client';

import { useState, useTransition } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Local, VisitaMensual, Vendedor } from '@/types/valisbiz';
import { Search, MapPin, Plus, Edit2, Trash2, CalendarCheck2 } from 'lucide-react';
import ModalVisita from './ModalVisita';
import ModalLocal from './ModalLocal';
import { eliminarLocal } from '../acciones/crm';

// Custom Map Pins icons
const markerIconHtml = (cadena: string, estadoVisita?: 'con_compra' | 'sin_compra') => {
  let color = '#94a3b8'; // Gris (Pendiente por defecto)
  
  if (estadoVisita === 'con_compra') color = '#10b981'; // Verde
  else if (estadoVisita === 'sin_compra') color = '#f59e0b'; // Naranja

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface MapaLocalesClientProps {
  locales: Local[];
  visitas: VisitaMensual[];
  vendedores: Vendedor[];
}

export default function MapaLocalesClient({ locales, visitas, vendedores }: MapaLocalesClientProps) {
  const [filter, setFilter] = useState<string>('Todas');
  const [search, setSearch] = useState('');
  const [activeLocal, setActiveLocal] = useState<Local | null>(null);

  // Modals state
  const [showVisitaModal, setShowVisitaModal] = useState(false);
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [localAEditar, setLocalAEditar] = useState<Local | null>(null);
  
  const [isPending, startTransition] = useTransition();

  const filteredLocales = locales.filter(local => {
    const matchChain = filter === 'Todas' || local.cadena === filter;
    const matchSearch = local.nombre_local.toLowerCase().includes(search.toLowerCase()) || local.cadena.toLowerCase().includes(search.toLowerCase());
    return matchChain && matchSearch;
  });

  const center: [number, number] = activeLocal 
    ? [Number(activeLocal.latitud), Number(activeLocal.longitud)]
    : [8.9824, -79.5199]; // Panama City default

  const handleEliminarLocal = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este local?')) {
      startTransition(async () => {
        await eliminarLocal(id);
      });
    }
  };

  const getVisitaDelMes = (localId: string) => {
    // Si hay multiples, agarramos la mas reciente del mes actual
    const visitasLocal = visitas.filter(v => v.local_id === localId);
    if (visitasLocal.length === 0) return null;
    return visitasLocal.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filter and Query Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] w-5 h-5" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#6d7a72] text-sm focus:outline-none focus:bg-[#eaedff] transition-all" 
            placeholder="Buscar por sucursal o cadena..." 
            type="text" 
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['Todas', 'Rey', 'Super 99', 'Riba Smith', 'Mr. Precio'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${filter === f ? 'bg-[#006948] text-white' : 'bg-[#eaedff] text-[#131b2e] hover:bg-[#dae2fd]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* CRM Dashboard Split Panel - Reverse on Mobile so map is on top */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* Interactive Map Container (5 cols) */}
        <div className="order-1 lg:order-2 lg:col-span-5 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-[#131b2e]">Puntos Georreferenciados</span>
            </div>
            <span className="font-mono text-xs text-[#6d7a72]">Panamá Metro</span>
          </div>

          <div className="relative w-full h-[50vh] lg:h-[400px] rounded-xl overflow-hidden border border-slate-200 z-0">
            <MapContainer 
              center={center} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <ChangeView center={center} zoom={activeLocal ? 16 : 12} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredLocales.map((local) => {
                const visita = getVisitaDelMes(local.id);
                return (
                  <Marker 
                    key={local.id} 
                    position={[Number(local.latitud), Number(local.longitud)]}
                    icon={markerIconHtml(local.cadena, visita?.estado_visita)}
                    eventHandlers={{
                      click: () => setActiveLocal(local),
                    }}
                  >
                    <Popup>
                      <div className="font-sans min-w-[150px]">
                        <h4 className="font-bold text-sm m-0 leading-tight mb-1">{local.nombre_local}</h4>
                        <p className="text-xs text-[#6d7a72] m-0 mb-2">{local.cadena}</p>
                        
                        <div className="border-t border-slate-100 pt-2 mt-2">
                          {visita ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Última Visita</span>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <span>{visita.vendedor?.nombre || 'Vendedor'}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mt-1 ${visita.estado_visita === 'con_compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {visita.estado_visita === 'con_compra' ? 'Con Compra' : 'Sin Compra'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">Pendiente de Visita</span>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <div className="mt-4 px-2">
            <button 
              onClick={() => setShowVisitaModal(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CalendarCheck2 className="w-5 h-5" />
              Registrar Visita
            </button>
            <div className="flex justify-center gap-4 mt-3 text-[10px] font-bold uppercase text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Pendiente</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Con Compra</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Sin Compra</span>
            </div>
          </div>
        </div>

        {/* Locales Admin Table (7 cols) */}
        <div className="order-2 lg:order-1 lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Directorio de Clientes</h3>
                <p className="text-sm text-[#3d4a42]">Administra la ubicación de los puntos de venta</p>
              </div>
              <button 
                onClick={() => { setLocalAEditar(null); setShowLocalModal(true); }}
                className="inline-flex items-center justify-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Nuevo Local
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#6d7a72] text-xs uppercase tracking-wider">
                    <th className="py-3 px-3 rounded-l-xl min-w-[200px]">Cadena / Local</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right rounded-r-xl min-w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff] text-sm text-[#131b2e]">
                  {filteredLocales.map(local => {
                    let dotColor = 'bg-[#6d7a72]';
                    if (local.cadena === 'Rey') dotColor = 'bg-[#006948]';
                    if (local.cadena === 'Super 99') dotColor = 'bg-[#ba1a1a]';
                    if (local.cadena === 'Riba Smith') dotColor = 'bg-[#4648d4]';
                    if (local.cadena === 'Mr. Precio') dotColor = 'bg-[#2b6954]';

                    const visita = getVisitaDelMes(local.id);

                    return (
                      <tr 
                        key={local.id} 
                        className={`hover:bg-[#f2f3ff] transition-colors ${activeLocal?.id === local.id ? 'bg-[#eaedff]' : ''}`}
                      >
                        <td 
                          className="py-3.5 px-3 font-semibold flex items-center gap-2 cursor-pointer"
                          onClick={() => setActiveLocal(local)}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`}></span>
                          <div>
                            <span className="block font-bold">{local.nombre_local}</span>
                            <span className="text-xs text-[#6d7a72]">{local.cadena}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3" onClick={() => setActiveLocal(local)}>
                           {visita ? (
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${visita.estado_visita === 'con_compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              Visitado
                            </span>
                           ) : (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">Pendiente</span>
                           )}
                        </td>
                        <td className="py-3.5 px-3 text-right flex items-center justify-end gap-1">
                          <button 
                            onClick={() => { setLocalAEditar(local); setShowLocalModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEliminarLocal(local.id)}
                            disabled={isPending}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLocales.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">No hay locales que coincidan con la búsqueda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showVisitaModal && (
        <ModalVisita 
          locales={locales}
          vendedores={vendedores}
          localInicial={activeLocal}
          onClose={() => setShowVisitaModal(false)}
        />
      )}

      {showLocalModal && (
        <ModalLocal 
          localAEditar={localAEditar}
          onClose={() => setShowLocalModal(false)}
        />
      )}
    </div>
  );
}
