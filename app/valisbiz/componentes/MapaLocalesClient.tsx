'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Local } from '@/types/valisbiz';
import { Search } from 'lucide-react';

// Custom Map Pins icons
const markerIconHtml = (cadena: string) => {
  let color = '#6d7a72';
  if (cadena === 'Rey') color = '#006948';
  if (cadena === 'Super 99') color = '#ba1a1a';
  if (cadena === 'Riba Smith') color = '#4648d4';
  if (cadena === 'Mr. Precio') color = '#2b6954';

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
}

export default function MapaLocalesClient({ locales }: MapaLocalesClientProps) {
  const [filter, setFilter] = useState<string>('Todas');
  const [search, setSearch] = useState('');
  const [activeLocal, setActiveLocal] = useState<Local | null>(null);

  const filteredLocales = locales.filter(local => {
    const matchChain = filter === 'Todas' || local.cadena === filter;
    const matchSearch = local.nombre_local.toLowerCase().includes(search.toLowerCase()) || local.cadena.toLowerCase().includes(search.toLowerCase());
    return matchChain && matchSearch;
  });

  const center: [number, number] = activeLocal 
    ? [Number(activeLocal.latitud), Number(activeLocal.longitud)]
    : [8.9824, -79.5199]; // Panama City default

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

      {/* Geospatial Map and BI Grid Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Simulated Map Container (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#131b2e]">Puntos Georreferenciados</span>
            </div>
            <span className="font-mono text-xs text-[#6d7a72]">Panamá Metro</span>
          </div>

          <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 z-0">
            <MapContainer 
              center={center} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <ChangeView center={center} zoom={activeLocal ? 15 : 12} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredLocales.map((local) => (
                <Marker 
                  key={local.id} 
                  position={[Number(local.latitud), Number(local.longitud)]}
                  icon={markerIconHtml(local.cadena)}
                  eventHandlers={{
                    click: () => setActiveLocal(local),
                  }}
                >
                  <Popup>
                    <div className="font-sans">
                      <h4 className="font-bold text-sm m-0 leading-tight">{local.nombre_local}</h4>
                      <p className="text-xs text-[#6d7a72] m-0 mt-1">{local.cadena}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* PowerBI Synchronized Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Rendimiento por Punto de Venta</h3>
                <p className="text-sm text-[#3d4a42]">Haz clic en una fila para centrar en el visualizador</p>
              </div>
              <span className="font-mono text-xs bg-[#eaedff] px-2.5 py-1 rounded-md text-[#131b2e] font-semibold">
                {filteredLocales.length} Locales
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#6d7a72] text-xs uppercase tracking-wider">
                    <th className="py-3 px-3 rounded-l-xl">Cadena / Local</th>
                    <th className="py-3 px-3">Dirección</th>
                    <th className="py-3 px-3 text-right rounded-r-xl">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff] text-sm text-[#131b2e]">
                  {filteredLocales.map(local => {
                    let dotColor = 'bg-[#6d7a72]';
                    if (local.cadena === 'Rey') dotColor = 'bg-[#006948]';
                    if (local.cadena === 'Super 99') dotColor = 'bg-[#ba1a1a]';
                    if (local.cadena === 'Riba Smith') dotColor = 'bg-[#4648d4]';
                    if (local.cadena === 'Mr. Precio') dotColor = 'bg-[#2b6954]';

                    return (
                      <tr 
                        key={local.id} 
                        onClick={() => setActiveLocal(local)}
                        className={`hover:bg-[#f2f3ff] cursor-pointer transition-colors ${activeLocal?.id === local.id ? 'bg-[#eaedff]' : ''}`}
                      >
                        <td className="py-3.5 px-3 font-semibold flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                          <div>
                            <span className="block font-bold">{local.nombre_local}</span>
                            <span className="text-xs text-[#6d7a72]">{local.cadena}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-xs">{local.direccion || 'Sin dirección registrada'}</td>
                        <td className="py-3.5 px-3 text-right">
                          <button className="text-[#006948] text-xs font-bold hover:underline">Ver en Mapa</button>
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
    </div>
  );
}
