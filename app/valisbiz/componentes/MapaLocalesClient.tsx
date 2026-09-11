'use client';

import { useState, useTransition, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Local, VisitaMensual, Vendedor } from '@/types/valisbiz';
import { Search, MapPin, Plus, Edit2, Trash2, CalendarCheck2, Maximize, Minimize } from 'lucide-react';
import ModalVisita from './ModalVisita';
import ModalLocal from './ModalLocal';
import { eliminarLocal, eliminarVisita } from '../acciones/crm';

// Custom Map Pins icons
const markerIconHtml = (cadena: string, estadoVisita?: 'con_compra' | 'sin_compra') => {
  let color = '#94a3b8'; // Gris (Pendiente por defecto)
  let extraClass = '';
  
  if (estadoVisita === 'con_compra') {
    color = '#10b981'; // Verde
    extraClass = 'marker-con-compra';
  } else if (estadoVisita === 'sin_compra') {
    color = '#f59e0b'; // Naranja
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="${extraClass}" style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
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
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [search, setSearch] = useState('');
  const [activeLocal, setActiveLocal] = useState<Local | null>(null);

  // Modals state
  const [showVisitaModal, setShowVisitaModal] = useState(false);
  const [visitaAEditar, setVisitaAEditar] = useState<VisitaMensual | null>(null);
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [localAEditar, setLocalAEditar] = useState<Local | null>(null);
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Paginación
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  
  const [isPending, startTransition] = useTransition();

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  };

  const handleEliminarVisita = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta visita?')) {
      startTransition(async () => {
        try {
          await eliminarVisita(id);
          setActiveLocal(null);
        } catch (error) {
          alert('Error al eliminar la visita');
        }
      });
    }
  };

  const filteredLocales = locales.filter(local => {
    const matchChain = filter === 'Todas' || local.tipo === filter;
    const matchSearch = local.nombre_local.toLowerCase().includes(search.toLowerCase()) || local.tipo.toLowerCase().includes(search.toLowerCase());
    return matchChain && matchSearch;
  });

  // Efecto para resetear paginación si se busca o filtra
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.ceil(filteredLocales.length / ITEMS_PER_PAGE);
  const paginatedLocales = showAll ? filteredLocales : filteredLocales.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const center: [number, number] = activeLocal 
    ? [Number(activeLocal.latitud), Number(activeLocal.longitud)]
    : [8.8824, -79.7853]; // La Chorrera default

  const handleEliminarLocal = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este local?')) {
      startTransition(async () => {
        await eliminarLocal(id);
      });
    }
  };

  const getResumenVisitas = (localId: string) => {
    let visitasLocal = visitas.filter(v => v.local_id === localId);
    if (filterFecha) {
      visitasLocal = visitasLocal.filter(v => v.fecha === filterFecha);
    }
    if (visitasLocal.length === 0) return null;
    
    visitasLocal.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    const count = visitasLocal.length;
    const conCompra = visitasLocal.some(v => v.estado_visita === 'con_compra');
    const mejorEstado = conCompra ? 'con_compra' : 'sin_compra';
    
    return {
      count,
      mejorEstado,
      ultimaVisita: visitasLocal[0]
    };
  };

  const visitasMostradas = filterFecha ? visitas.filter(v => v.fecha === filterFecha) : visitas;

  const countSuper = locales.filter(l => l.tipo === 'Supermercado').length;
  const countDistribuidora = locales.filter(l => l.tipo === 'Distribuidora').length;
  const countTienda = locales.filter(l => l.tipo === 'Tienda').length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filter and Query Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a72] w-5 h-5" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#6d7a72] text-sm focus:outline-none focus:bg-[#eaedff] transition-all" 
            placeholder="Buscar por sucursal..." 
            type="text" 
          />
        </div>
        
        <div className="w-full md:w-auto">
          <input 
            type="date"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 rounded-full bg-[#f2f3ff] text-[#131b2e] text-sm focus:outline-none focus:bg-[#eaedff] transition-all border border-slate-200"
            title="Filtrar mapa y tablas por fecha exacta"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['Todas', 'Supermercado', 'Distribuidora', 'Tienda'].map(f => (
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

      {/* CRM Dashboard Stacked Panel (Map Top, Table Bottom) */}
      <div className="flex flex-col gap-6">
        
        {/* Interactive Map Container */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-[#131b2e]">Vista interactiva de visitas</span>
            </div>
            <span className="font-mono text-xs text-[#6d7a72]">Panamá Metro</span>
          </div>

          <div className={isFullScreen 
            ? "fixed inset-0 z-[1000] w-screen h-screen bg-slate-50 flex flex-col p-2 sm:p-4 animate-in fade-in zoom-in-95 duration-200"
            : "relative w-full h-[50vh] lg:h-[400px] rounded-xl overflow-hidden border border-slate-200 z-0"}
          >
            {isFullScreen && (
              <div className="flex items-center justify-between mb-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-[#131b2e] hidden sm:inline">Vista interactiva de visitas</span>
                  <span className="font-bold text-[#131b2e] sm:hidden">Vista interactiva</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setVisitaAEditar(null); setShowVisitaModal(true); setIsFullScreen(false); }}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all"
                  >
                    <CalendarCheck2 className="w-4 h-4" /> Registrar Visita
                  </button>
                  <button onClick={handleToggleFullScreen} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
                    <Minimize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            <div className={`relative ${isFullScreen ? 'flex-1 rounded-2xl overflow-hidden shadow-md border border-slate-300' : 'w-full h-full'}`}>
              <MapContainer 
                center={center} 
                zoom={13} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
              >
                <ChangeView center={center} zoom={activeLocal ? 16 : (isFullScreen ? 11 : 12)} />
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Mapa Estándar">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satélite">
                    <TileLayer
                      attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                {filteredLocales.map((local) => {
                  const resumen = getResumenVisitas(local.id);
                  return (
                    <Marker 
                      key={local.id} 
                      position={[Number(local.latitud), Number(local.longitud)]}
                      icon={markerIconHtml(local.tipo, resumen?.mejorEstado as any)}
                      eventHandlers={{
                        click: () => setActiveLocal(local),
                      }}
                    >
                      <Popup>
                        <div className="font-sans min-w-[150px] max-w-[200px]">
                          {local.foto_url && (
                            <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-slate-100 relative">
                              <img src={local.foto_url} alt={local.nombre_local} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <h4 className="font-bold text-sm m-0 leading-tight mb-1">{local.nombre_local}</h4>
                          <p className="text-xs text-[#6d7a72] m-0 mb-2">{local.tipo}</p>
                          
                          <div className="border-t border-slate-100 pt-2 mt-2">
                            {resumen ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Última Visita</span>
                                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{resumen.count} {resumen.count === 1 ? 'visita' : 'visitas'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                  <span>{resumen.ultimaVisita.vendedor?.nombre || 'Vendedor'}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mt-1 ${resumen.mejorEstado === 'con_compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {resumen.mejorEstado === 'con_compra' ? 'Con Compra' : 'Sin Compra'}
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

              {!isFullScreen && (
                <button 
                  onClick={handleToggleFullScreen}
                  className="absolute top-3 right-3 z-[400] p-2 bg-white/95 backdrop-blur shadow-sm border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-colors flex items-center gap-2 group"
                  title="Ampliar mapa"
                >
                  <Maximize className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 px-2">
            <button 
              onClick={() => { setVisitaAEditar(null); setShowVisitaModal(true); }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CalendarCheck2 className="w-5 h-5" />
              Registrar Visita
            </button>
            <div className="flex justify-center gap-6 mt-4 text-xs font-bold uppercase text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Pendiente</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 marker-con-compra"></span> Con Compra</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Sin Compra</span>
            </div>
          </div>
        </div>

        {/* Locales Admin Table */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#131b2e]">Directorio de Clientes</h3>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full" title="Supermercados">{countSuper}</span>
                    <span className="bg-[#4648d4]/10 text-[#4648d4] text-[10px] font-bold px-2 py-0.5 rounded-full" title="Distribuidoras">{countDistribuidora}</span>
                    <span className="bg-[#006948]/10 text-[#006948] text-[10px] font-bold px-2 py-0.5 rounded-full" title="Tiendas">{countTienda}</span>
                  </div>
                </div>
                <p className="text-sm text-[#3d4a42]">Administra la ubicación de los puntos de venta</p>
                <div className="flex sm:hidden items-center gap-2 mt-2">
                  <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full">{countSuper} Super</span>
                  <span className="bg-[#4648d4]/10 text-[#4648d4] text-[10px] font-bold px-2 py-0.5 rounded-full">{countDistribuidora} Dist.</span>
                  <span className="bg-[#006948]/10 text-[#006948] text-[10px] font-bold px-2 py-0.5 rounded-full">{countTienda} Tiendas</span>
                </div>
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
                    <th className="py-3 px-3 rounded-l-xl min-w-[200px]">Tipo / Local</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right rounded-r-xl min-w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff] text-sm text-[#131b2e]">
                  {paginatedLocales.map(local => {
                    let dotColor = 'bg-[#6d7a72]';
                    if (local.tipo === 'Supermercado') dotColor = 'bg-[#ba1a1a]';
                    if (local.tipo === 'Distribuidora') dotColor = 'bg-[#4648d4]';
                    if (local.tipo === 'Tienda') dotColor = 'bg-[#006948]';

                    const resumen = getResumenVisitas(local.id);

                    return (
                      <tr 
                        key={local.id} 
                        className={`hover:bg-[#f2f3ff] transition-colors ${activeLocal?.id === local.id ? 'bg-[#eaedff]' : ''}`}
                      >
                        <td 
                          className="py-3.5 px-3 font-semibold flex items-center gap-3 cursor-pointer"
                          onClick={() => setActiveLocal(local)}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`}></span>
                          
                          {local.foto_url ? (
                            <img src={local.foto_url} alt={local.nombre_local} className="w-8 h-8 rounded-full object-cover shrink-0 bg-slate-100 border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                              <MapPin className="w-4 h-4 text-slate-400" />
                            </div>
                          )}

                          <div>
                            <span className="block font-bold">{local.nombre_local}</span>
                            <span className="text-xs text-[#6d7a72]">{local.tipo}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3" onClick={() => setActiveLocal(local)}>
                           {resumen ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${resumen.mejorEstado === 'con_compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {resumen.mejorEstado === 'con_compra' ? 'Con Compra' : 'Sin Compra'}
                              </span>
                              {resumen.count > 1 && (
                                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded w-fit">
                                  {resumen.count} visitas
                                </span>
                              )}
                            </div>
                           ) : (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 whitespace-nowrap">Pendiente</span>
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

            {/* Controles de Paginación */}
            {!showAll && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-slate-500">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredLocales.length)} de {filteredLocales.length}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
            {filteredLocales.length > ITEMS_PER_PAGE && (
              <button 
                onClick={() => {
                  setShowAll(!showAll);
                  setCurrentPage(1);
                }}
                className="mt-4 w-full py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                {showAll ? 'Mostrar Paginado' : 'Mostrar Todos'}
              </button>
            )}

          </div>
        </div>

        {/* Tabla de Historial de Visitas */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Registros de Visitas</h3>
                <p className="text-sm text-[#3d4a42]">Historial de visitas realizadas este mes</p>
              </div>
              <button 
                onClick={() => { setVisitaAEditar(null); setShowVisitaModal(true); }}
                className="inline-flex items-center justify-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Registrar Visita
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f2f3ff] text-[#6d7a72] text-xs uppercase tracking-wider">
                    <th className="py-3 px-3 rounded-l-xl min-w-[150px]">Fecha / Vendedor</th>
                    <th className="py-3 px-3 min-w-[200px]">Local</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right rounded-r-xl min-w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff] text-sm text-[#131b2e]">
                  {visitasMostradas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        {filterFecha ? 'No hay visitas en esta fecha.' : 'No hay visitas registradas este mes.'}
                      </td>
                    </tr>
                  ) : (
                    visitasMostradas.map(visita => (
                      <tr key={visita.id} className="hover:bg-[#f2f3ff] transition-colors">
                        <td className="py-3 px-3">
                          <span className="block font-bold">{new Date(visita.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                          <span className="text-xs text-[#6d7a72]">{visita.vendedor?.nombre}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="block font-bold">{visita.local?.nombre_local}</span>
                          <span className="text-xs text-[#6d7a72]">{visita.local?.tipo}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${visita.estado_visita === 'con_compra' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {visita.estado_visita === 'con_compra' ? 'Con Compra' : 'Sin Compra'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right flex items-center justify-end gap-1">
                          <button 
                            onClick={() => { setVisitaAEditar(visita); setShowVisitaModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEliminarVisita(visita.id)}
                            disabled={isPending}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
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
          visitaAEditar={visitaAEditar}
          onClose={() => { setShowVisitaModal(false); setVisitaAEditar(null); }}
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
