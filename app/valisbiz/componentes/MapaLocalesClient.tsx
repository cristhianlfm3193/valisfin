'use client';

import { useState, useTransition, useEffect, useOptimistic, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Local, VisitaMensual, Vendedor } from '@/types/valisbiz';
import { Search, MapPin, Plus, Edit2, Trash2, CalendarCheck2, Maximize, Minimize, X, Route, BadgeCheck } from 'lucide-react';
import ModalVisita from './ModalVisita';
import ModalLocal from './ModalLocal';
import ModalReporteEficiencia from './ModalReporteEficiencia';
import ModalDesempenoRuta from './ModalDesempenoRuta';
import { TrendingUp, FileDown, Eye, Layers } from 'lucide-react';
import { eliminarLocal, eliminarVisita } from '../acciones/crm';
import { Btn3D } from '@/app/components/Btn3D';

// Custom Map Pins icons
const markerIconHtml = (cadena: string, estadoVisita?: 'con_compra' | 'sin_compra') => {
  let color = '#94a3b8'; // Gris (Pendiente por defecto)
  let extraClass = '';
  
  if (estadoVisita === 'con_compra') {
    color = '#10b981'; // Verde
    extraClass = 'marker-con-compra';
  } else if (estadoVisita === 'sin_compra') {
    color = '#ef4444'; // Rojo
    extraClass = 'marker-sin-compra';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="${extraClass}" style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapFitter({ selectedLocales }: { selectedLocales: Local[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocales.length === 1) {
      const local = selectedLocales[0];
      if (local.latitud && local.longitud && (Number(local.latitud) !== 0 || Number(local.longitud) !== 0)) {
        map.setView([Number(local.latitud), Number(local.longitud)], 16, { animate: true });
      }
    } else if (selectedLocales.length > 1) {
      const validLocales = selectedLocales.filter(l => l.latitud && l.longitud && (Number(l.latitud) !== 0 || Number(l.longitud) !== 0));
      if (validLocales.length > 1) {
        const bounds = L.latLngBounds(validLocales.map(l => [Number(l.latitud), Number(l.longitud)]));
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      } else if (validLocales.length === 1) {
        map.setView([Number(validLocales[0].latitud), Number(validLocales[0].longitud)], 16, { animate: true });
      }
    } else if (selectedLocales.length === 0) {
      map.setView([8.8824, -79.7853], 13, { animate: true });
      map.closePopup();
    }
  }, [selectedLocales, map]);

  return null;
}

interface MapaLocalesClientProps {
  locales: Local[];
  visitas: VisitaMensual[];
  vendedores: Vendedor[];
}

export default function MapaLocalesClient({ locales, visitas, vendedores }: MapaLocalesClientProps) {
  // Estado optimista para locales
  const [optimisticLocales, addOptimisticLocal] = useOptimistic(
    locales,
    (state: Local[], newOrUpdatedLocal: Local | { id: string, delete: boolean }) => {
      if ('delete' in newOrUpdatedLocal) {
        return state.filter(l => l.id !== newOrUpdatedLocal.id);
      }
      const index = state.findIndex(l => l.id === newOrUpdatedLocal.id);
      if (index !== -1) {
        const newState = [...state];
        newState[index] = { ...newState[index], ...newOrUpdatedLocal };
        return newState;
      }
      return [newOrUpdatedLocal, ...state];
    }
  );

  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    setPortalElement(document.getElementById('header-actions-portal'));
  }, []);

  const [showModalRuta, setShowModalRuta] = useState(false);
  const [showModalReporte, setShowModalReporte] = useState(false);
  const [filter, setFilter] = useState<string>('Todas');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedLocales, setSelectedLocales] = useState<Local[]>([]);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  // Sorting and Column Filters
  const [sortConfig, setSortConfig] = useState<{ key: 'nombre' | 'vendedor' | 'estado' | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [colFilterVendedor, setColFilterVendedor] = useState<string>('');
  const [colFilterEstado, setColFilterEstado] = useState<string>('');

  const handleClearFilters = () => {
    setSearch('');
    setFechaDesde('');
    setFechaHasta('');
    setFilter('Todas');
    setColFilterVendedor('');
    setColFilterEstado('');
    setSelectedLocales([]);
    setModoRutaActivo(false);
    setRutaData(null);
    setRutaDistancia(null);
    setRutaVendedor('');
    setRutaFecha(new Date().toISOString().split('T')[0]);
  };

  const handleSort = (key: 'nombre' | 'vendedor' | 'estado') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleLocalSelection = (local: Local) => {
    setSelectedLocales(prev => {
      // Si el local ya estaba seleccionado, lo deseleccionamos (comportamiento original)
      if (prev.find(l => l.id === local.id)) {
        return prev.filter(l => l.id !== local.id);
      }
      // Si se selecciona uno nuevo desde la tabla o mapa, lo ponemos solo (facilita enfocar y ver el popup)
      return [local];
    });
    // Hacemos scroll suave hacia el mapa si el usuario está abajo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedLocales.length === 1) {
      const local = selectedLocales[0];
      const marker = markerRefs.current[local.id];
      if (marker) {
        // Un pequeño timeout asegura que el mapa haya hecho el 'fit' primero
        setTimeout(() => {
          marker.openPopup();
        }, 300);
      }
    }
  }, [selectedLocales]);

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

  // Route Analysis State
  const [rutaVendedor, setRutaVendedor] = useState<string>('');
  const [rutaFecha, setRutaFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rutaData, setRutaData] = useState<any>(null);
  const [rutaDistancia, setRutaDistancia] = useState<number | null>(null);
  const [isCalculandoRuta, setIsCalculandoRuta] = useState(false);
  const [rutaError, setRutaError] = useState<string | null>(null);
  const [rutaVisitas, setRutaVisitas] = useState<any[]>([]);
  const [modoRutaActivo, setModoRutaActivo] = useState(false);

  const calcularRuta = async () => {
    if (!rutaVendedor) {
      setRutaError('Selecciona un vendedor primero.');
      return;
    }
    
    setIsCalculandoRuta(true);
    setRutaError(null);
    setRutaData(null);
    setRutaDistancia(null);

    const visitasDelDia = visitas
      .filter(v => v.vendedor_id === rutaVendedor && v.fecha === rutaFecha)
      .map(v => ({ ...v, fullLocal: locales.find(l => l.id === v.local_id) }))
      .filter(v => v.fullLocal && v.fullLocal.latitud && v.fullLocal.longitud)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (visitasDelDia.length < 2) {
      setRutaError('Se necesitan al menos 2 visitas registradas en este día para trazar una ruta.');
      setIsCalculandoRuta(false);
      setRutaVisitas(visitasDelDia);
      return;
    }

    setRutaVisitas(visitasDelDia);

    const coordinatesString = visitasDelDia.map(v => `${v.fullLocal!.longitud},${v.fullLocal!.latitud}`).join(';');
    
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRutaData(route.geometry);
        setRutaDistancia(route.distance / 1000);
        
        const pointsToSelect = locales.filter(l => visitasDelDia.find(v => v.local_id === l.id));
        setSelectedLocales(pointsToSelect); 
        setModoRutaActivo(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setRutaError('No se pudo calcular la ruta en las calles (Error de OSRM).');
      }
    } catch (err) {
      setRutaError('Error de red al conectar con el servidor de rutas.');
    } finally {
      setIsCalculandoRuta(false);
    }
  };

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
          setSelectedLocales(prev => prev.filter(l => l.id !== id));
        } catch (error) {
          alert('Error al eliminar la visita');
        }
      });
    }
  };

  const filteredLocales = optimisticLocales.filter(local => {
    if (modoRutaActivo) {
      return rutaVisitas.some(v => v.local_id === local.id);
    }
    const matchChain = filter === 'Todas' || local.tipo === filter;
    const matchSearch = local.nombre_local.toLowerCase().includes(search.toLowerCase()) || local.tipo.toLowerCase().includes(search.toLowerCase());
    const matchVendedor = colFilterVendedor === '' || local.vendedor_id === colFilterVendedor || (colFilterVendedor === 'sin_asignar' && !local.vendedor_id);
    const resumen = getResumenVisitas(local.id);
    let estadoLocal = 'pendiente';
    if (resumen) {
      estadoLocal = resumen.mejorEstado;
    }

    const matchEstado = colFilterEstado === '' || estadoLocal === colFilterEstado;
    return matchChain && matchSearch && matchVendedor && matchEstado;
  }).sort((a, b) => {
    if (a.activo !== b.activo) {
      return a.activo ? -1 : 1; // Inactivos siempre al final
    }

    if (sortConfig.key) {
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;
      
      if (sortConfig.key === 'nombre') {
        return a.nombre_local.localeCompare(b.nombre_local) * modifier;
      }
      if (sortConfig.key === 'vendedor') {
        const vA = vendedores.find(v => v.id === a.vendedor_id)?.nombre || '';
        const vB = vendedores.find(v => v.id === b.vendedor_id)?.nombre || '';
        return vA.localeCompare(vB) * modifier;
      }
      if (sortConfig.key === 'estado') {
        const resA = getResumenVisitas(a.id);
        const resB = getResumenVisitas(b.id);
        const stateA = resA ? (resA.mejorEstado === 'con_compra' ? 2 : 1) : 0;
        const stateB = resB ? (resB.mejorEstado === 'con_compra' ? 2 : 1) : 0;
        return (stateA - stateB) * modifier;
      }
    }
    
    return 0; // Default order
  });

  // Efecto para resetear paginación si se busca o filtra
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalPages = Math.ceil(filteredLocales.length / ITEMS_PER_PAGE);
  const paginatedLocales = showAll ? filteredLocales : filteredLocales.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);


  const handleEliminarLocal = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este local?')) {
      startTransition(async () => {
        await eliminarLocal(id);
      });
    }
  };

  function getResumenVisitas(localId: string) {
    let visitasLocal = visitas.filter(v => v.local_id === localId);
    if (fechaDesde) {
      visitasLocal = visitasLocal.filter(v => v.fecha >= fechaDesde);
    }
    if (fechaHasta) {
      visitasLocal = visitasLocal.filter(v => v.fecha <= fechaHasta);
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
  }

  let visitasMostradas = visitas;
  if (fechaDesde) {
    visitasMostradas = visitasMostradas.filter(v => v.fecha >= fechaDesde);
  }
  if (fechaHasta) {
    visitasMostradas = visitasMostradas.filter(v => v.fecha <= fechaHasta);
  }
  if (filter !== 'Todas') {
    visitasMostradas = visitasMostradas.filter(v => v.local?.tipo === filter);
  }
  if (colFilterVendedor !== '') {
    if (colFilterVendedor === 'sin_asignar') {
      visitasMostradas = visitasMostradas.filter(v => !v.vendedor_id);
    } else {
      visitasMostradas = visitasMostradas.filter(v => v.vendedor_id === colFilterVendedor);
    }
  }
  if (colFilterEstado !== '') {
    if (colFilterEstado === 'con_compra' || colFilterEstado === 'sin_compra') {
      visitasMostradas = visitasMostradas.filter(v => v.estado_visita === colFilterEstado);
    } else if (colFilterEstado === 'pendiente') {
      visitasMostradas = [];
    }
  }

  const countSuper = locales.filter(l => l.tipo === 'Supermercado').length;
  const countDistribuidora = locales.filter(l => l.tipo === 'Distribuidora').length;
  const countTienda = locales.filter(l => l.tipo === 'Tienda').length;
  const countMiniSuper = locales.filter(l => l.tipo === 'Mini Super').length;
  const countRestaurante = locales.filter(l => l.tipo === 'Restaurante').length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filter and Query Bar */}
      <div className="bg-[#121c27] p-3 rounded-2xl shadow-sm border border-white/5 flex flex-col lg:flex-row gap-3 items-stretch lg:items-end justify-between">
        <div className="relative w-full lg:w-64 shrink-0 mb-0 lg:mb-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 text-slate-200 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-indigo-500/10 transition-all border border-transparent focus:border-indigo-500/30" 
            placeholder="Buscar por sucursal..." 
            type="text" 
          />
        </div>
        
        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 w-full lg:w-auto flex-1">
          <div className="col-span-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 ml-1 block leading-none">Desde</label>
            <input 
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white/5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all border border-white/10"
            />
          </div>
          <div className="col-span-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 ml-1 block leading-none">Hasta</label>
            <input 
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white/5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all border border-white/10"
            />
          </div>
          <div className="col-span-1 lg:w-40">
            <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 ml-1 block leading-none">Categoría</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
            >
              <option value="Todas" className="bg-[#121c27]">Todas</option>
              <option value="Supermercado" className="bg-[#121c27]">Supermercado</option>
              <option value="Distribuidora" className="bg-[#121c27]">Distribuidora</option>
              <option value="Tienda" className="bg-[#121c27]">Tienda</option>
              <option value="Mini Super" className="bg-[#121c27]">Mini Super</option>
              <option value="Restaurante" className="bg-[#121c27]">Restaurante</option>
            </select>
          </div>
          <div className="col-span-1 flex items-end">
            <button
              onClick={handleClearFilters}
              className="group flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-sm w-full h-[28px] shrink-0"
            >
              <X className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 shrink-0" />
              <span className="text-xs font-bold leading-none">Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* CRM Dashboard Stacked Panel (Map Top, Table Bottom) */}
      <div className="flex flex-col gap-6">
        
        {/* Interactive Map Container */}
        <div className="bg-[#121c27] rounded-2xl p-4 shadow-sm border border-white/5 flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-4 mb-3 px-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
              <span className="font-bold text-slate-200 leading-tight">Vista interactiva de visitas <span className="text-indigo-400 font-black">({filteredLocales.length})</span></span>
            </div>
            <span className="font-mono text-xs text-slate-400 shrink-0">Panamá Oeste</span>
          </div>

          <div className={isFullScreen 
            ? "fixed inset-0 z-[1000] w-screen h-screen bg-white/5 flex flex-col p-2 sm:p-4 animate-in fade-in zoom-in-95 duration-200"
            : "relative w-full h-[50vh] lg:h-[400px] rounded-xl overflow-hidden border border-white/10 z-0"}
          >
            {isFullScreen && (
              <div className="flex items-center justify-between mb-3 bg-[#121c27] p-3 rounded-2xl shadow-sm border border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-slate-200 hidden sm:inline">Vista interactiva de visitas <span className="text-indigo-400 font-black">({filteredLocales.length})</span></span>
                  <span className="font-bold text-slate-200 sm:hidden">Vista interactiva <span className="text-indigo-400 font-black">({filteredLocales.length})</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setVisitaAEditar(null); setShowVisitaModal(true); setIsFullScreen(false); }}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all"
                  >
                    <CalendarCheck2 className="w-4 h-4" /> Registrar Visita
                  </button>
                </div>
              </div>
            )}

            <div className={`relative ${isFullScreen ? 'flex-1 rounded-2xl overflow-hidden shadow-md border border-slate-300' : 'w-full h-full'}`}>
              <MapContainer 
                center={[8.8824, -79.7853]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
              >
                <MapFitter selectedLocales={selectedLocales} />
                <LayersControl position="topleft">
                  <LayersControl.BaseLayer name="Mapa Estándar">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer checked name="Satélite">
                    <TileLayer
                      attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                {rutaData && (
                  <GeoJSON 
                    key={JSON.stringify(rutaData.coordinates)} 
                    data={rutaData} 
                    pathOptions={{ color: '#4f46e5', weight: 6, opacity: 0.8, dashArray: '10, 15', lineCap: 'round' }} 
                  />
                )}
                {filteredLocales.map((local) => {
                  const resumen = getResumenVisitas(local.id);
                  return (
                    <Marker 
                      key={local.id} 
                      position={[Number(local.latitud), Number(local.longitud)]}
                      icon={markerIconHtml(local.tipo, resumen?.mejorEstado as any)}
                      ref={(ref) => {
                        markerRefs.current[local.id] = ref;
                      }}
                      eventHandlers={{
                        click: () => toggleLocalSelection(local),
                      }}
                    >
                      <Popup autoClose={false} closeOnClick={false}>
                        <div className="font-sans min-w-[150px] max-w-[200px]">
                          {local.foto_url && (
                            <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-white/10 relative">
                              <img src={local.foto_url} alt={local.nombre_local} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <h4 className="font-bold text-sm m-0 leading-tight mb-1">{local.nombre_local}</h4>
                          <p className="text-xs text-slate-400 m-0 mb-2">{local.tipo}</p>
                          
                          <div className="border-t border-white/5 pt-2 mt-2">
                            {resumen ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Última Visita</span>
                                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">{resumen.count} {resumen.count === 1 ? 'visita' : 'visitas'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                                  <span>{resumen.ultimaVisita.vendedor?.nombre || 'Vendedor'}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mt-1 ${resumen.mejorEstado === 'con_compra' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
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

              <button 
                onClick={handleToggleFullScreen}
                className="absolute top-3 right-3 z-[400] p-2 bg-[#121c27]/95 backdrop-blur shadow-sm border border-white/10 hover:bg-white/5 rounded-xl text-slate-300 transition-colors flex items-center gap-2 group"
                title={isFullScreen ? "Reducir mapa" : "Ampliar mapa"}
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 group-hover:scale-90 transition-transform" />
                ) : (
                  <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 px-2">
            <div className="flex justify-center gap-3 sm:gap-6 mt-4 text-xs font-bold uppercase text-slate-500 flex-wrap">
              <button onClick={() => setColFilterEstado(colFilterEstado === 'pendiente' ? '' : 'pendiente')} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${colFilterEstado === 'pendiente' ? 'bg-white/10 text-slate-200' : 'hover:bg-white/5'}`}><span className="w-3 h-3 rounded-full bg-slate-400"></span> Pendiente</button>
              <button onClick={() => setColFilterEstado(colFilterEstado === 'con_compra' ? '' : 'con_compra')} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${colFilterEstado === 'con_compra' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-emerald-500/20'}`}><span className="w-3 h-3 rounded-full bg-emerald-500 marker-con-compra"></span> Con Compra</button>
              <button onClick={() => setColFilterEstado(colFilterEstado === 'sin_compra' ? '' : 'sin_compra')} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${colFilterEstado === 'sin_compra' ? 'bg-red-500/20 text-red-400' : 'hover:bg-red-500/20'}`}><span className="w-3 h-3 rounded-full bg-red-500 marker-sin-compra"></span> Sin Compra</button>
            </div>
            
            <div className="flex justify-center gap-2 mt-4 text-[10px] font-bold flex-wrap">
              {vendedores.map(v => (
                <button 
                  key={v.id} 
                  onClick={() => setColFilterVendedor(colFilterVendedor === v.id ? '' : v.id)}
                  className={`px-3 py-1 rounded-full border transition-all ${colFilterVendedor === v.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105' : 'bg-indigo-500/20 text-indigo-400 border-indigo-100 hover:bg-indigo-500/200/200/20'}`}
                >
                  {v.nombre}
                </button>
              ))}
              <button 
                onClick={() => setColFilterVendedor(colFilterVendedor === 'sin_asignar' ? '' : 'sin_asignar')}
                className={`px-3 py-1 rounded-full border transition-all ${colFilterVendedor === 'sin_asignar' ? 'bg-slate-600 text-white border-slate-600 shadow-sm scale-105' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
              >
                No asignado
              </button>
            </div>
          </div>
        </div>

        {/* Top Action Bar (Modals) -> Ported to Top Header */}
        {portalElement && createPortal(
          <>
            <Btn3D color="rose" size="sm" onClick={() => setShowModalReporte(true)}>
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Eficiencia</span>
            </Btn3D>
            <Btn3D color="violet" size="sm" onClick={() => setShowModalRuta(true)}>
              <Route className="w-4 h-4" />
              <span className="hidden sm:inline">Desempeño</span>
            </Btn3D>
            <Btn3D color="pink" size="sm" onClick={() => { setVisitaAEditar(null); setShowVisitaModal(true); }}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Registrar Visita</span>
            </Btn3D>
          </>,
          portalElement
        )}

        {/* Route Stats Banner (if exists) */}
        {rutaError && (
          <div className="bg-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/30 flex items-center gap-2 mb-4">
            <X className="w-4 h-4 shrink-0" />
            {rutaError}
          </div>
        )}

        {rutaDistancia !== null && (
          <div className="bg-[#121c27] grid grid-cols-1 sm:grid-cols-3 gap-4 border border-white/5 rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col justify-center items-center text-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Distancia Recorrida</span>
              <span className="text-2xl font-black text-slate-200 flex items-baseline gap-1">{rutaDistancia.toFixed(1)} <span className="text-sm text-indigo-400 font-bold">km</span></span>
            </div>
            <div className="flex flex-col justify-center items-center text-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Visitas del Día</span>
              <span className="text-2xl font-black text-slate-200">{rutaVisitas.length}</span>
            </div>
            <div className="flex flex-col justify-center items-center text-center">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Eficiencia Aprox.</span>
              <span className="text-2xl font-black text-slate-200 flex items-baseline gap-1">{rutaVisitas.length > 0 ? (rutaDistancia / rutaVisitas.length).toFixed(1) : 0} <span className="text-sm text-emerald-400 font-bold">km/visita</span></span>
            </div>
          </div>
        )}

        {showModalRuta && (
          <ModalDesempenoRuta 
            onClose={() => setShowModalRuta(false)}
            vendedores={vendedores}
            rutaVendedor={rutaVendedor}
            setRutaVendedor={setRutaVendedor}
            rutaFecha={rutaFecha}
            setRutaFecha={setRutaFecha}
            calcularRuta={calcularRuta}
            isCalculandoRuta={isCalculandoRuta}
          />
        )}
        
        {showModalReporte && (
          <ModalReporteEficiencia onClose={() => setShowModalReporte(false)} />
        )}

        {/* Locales Admin Table */}
        <div className="bg-[#121c27] rounded-2xl p-4 sm:p-6 shadow-sm border border-white/5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-200">Directorio de Clientes</h3>
                  {selectedLocales.length > 0 && (
                    <button onClick={() => setSelectedLocales([])} className="text-[10px] bg-white/10 hover:bg-white/10 text-slate-400 px-2 py-1 rounded font-bold transition-colors">
                      Limpiar Filtro ({selectedLocales.length})
                    </button>
                  )}
                  <div className="hidden sm:flex items-center gap-2">
                    <button onClick={() => setFilter(filter === 'Supermercado' ? 'Todas' : 'Supermercado')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Supermercado' ? 'bg-pink-500 text-white shadow-sm scale-105' : 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20'}`} title="Supermercados">{countSuper} Super</button>
                    <button onClick={() => setFilter(filter === 'Distribuidora' ? 'Todas' : 'Distribuidora')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Distribuidora' ? 'bg-violet-500 text-white shadow-sm scale-105' : 'bg-violet-500/10 text-violet-500 hover:bg-violet-500/20'}`} title="Distribuidoras">{countDistribuidora} Dist.</button>
                    <button onClick={() => setFilter(filter === 'Mini Super' ? 'Todas' : 'Mini Super')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Mini Super' ? 'bg-fuchsia-500 text-white shadow-sm scale-105' : 'bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500/20'}`} title="Mini Supers">{countMiniSuper} Mini</button>
                    <button onClick={() => setFilter(filter === 'Tienda' ? 'Todas' : 'Tienda')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Tienda' ? 'bg-rose-500 text-white shadow-sm scale-105' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`} title="Tiendas">{countTienda} Tiendas</button>
                    <button onClick={() => setFilter(filter === 'Restaurante' ? 'Todas' : 'Restaurante')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Restaurante' ? 'bg-orange-500 text-white shadow-sm scale-105' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`} title="Restaurantes">{countRestaurante} Rest.</button>
                  </div>
                </div>
                <p className="text-sm text-[#3d4a42]">Administra la ubicación de los puntos de venta</p>
                <div className="flex sm:hidden items-center gap-2 mt-2">
                  <button onClick={() => setFilter(filter === 'Supermercado' ? 'Todas' : 'Supermercado')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Supermercado' ? 'bg-pink-500 text-white shadow-sm scale-105' : 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20'}`}>{countSuper} Super</button>
                  <button onClick={() => setFilter(filter === 'Distribuidora' ? 'Todas' : 'Distribuidora')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Distribuidora' ? 'bg-violet-500 text-white shadow-sm scale-105' : 'bg-violet-500/10 text-violet-500 hover:bg-violet-500/20'}`}>{countDistribuidora} Dist.</button>
                  <button onClick={() => setFilter(filter === 'Mini Super' ? 'Todas' : 'Mini Super')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Mini Super' ? 'bg-fuchsia-500 text-white shadow-sm scale-105' : 'bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500/20'}`}>{countMiniSuper} Mini</button>
                  <button onClick={() => setFilter(filter === 'Tienda' ? 'Todas' : 'Tienda')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Tienda' ? 'bg-rose-500 text-white shadow-sm scale-105' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}>{countTienda} Tiendas</button>
                  <button onClick={() => setFilter(filter === 'Restaurante' ? 'Todas' : 'Restaurante')} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${filter === 'Restaurante' ? 'bg-orange-500 text-white shadow-sm scale-105' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`}>{countRestaurante} Rest.</button>
                </div>
              </div>
              <button 
                onClick={() => { setLocalAEditar(null); setShowLocalModal(true); }}
                className="inline-flex items-center justify-center gap-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/200/200/20 px-3 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Nuevo Local
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-3 rounded-l-xl min-w-[200px] cursor-pointer hover:hover:bg-indigo-500/10 transition-colors" onClick={() => handleSort('nombre')}>
                      <div className="flex items-center gap-1">
                        Tipo / Local
                        {sortConfig.key === 'nombre' && (
                          <span className="text-indigo-500 text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-2 px-3 align-top min-w-[140px]">
                      <div 
                        className="cursor-pointer hover:text-indigo-400 transition-colors flex items-center gap-1 mb-1"
                        onClick={() => handleSort('vendedor')}
                      >
                        Vendedor
                        {sortConfig.key === 'vendedor' && (
                          <span className="text-indigo-500 text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                      <select 
                        className="w-full text-[10px] py-1 px-1 rounded border border-white/10 bg-[#121c27] text-slate-400 focus:outline-none focus:border-indigo-300"
                        value={colFilterVendedor}
                        onChange={e => setColFilterVendedor(e.target.value)}
                        onClick={e => e.stopPropagation()} // Prevent row click
                      >
                        <option value="">Todos</option>
                        <option value="sin_asignar">Sin Asignar</option>
                        {vendedores.map(v => (
                          <option key={v.id} value={v.id}>{v.nombre.split(' ')[0]}</option>
                        ))}
                      </select>
                    </th>
                    <th className="py-2 px-3 align-top min-w-[140px]">
                      <div 
                        className="cursor-pointer hover:text-indigo-400 transition-colors flex items-center gap-1 mb-1"
                        onClick={() => handleSort('estado')}
                      >
                        Estado
                        {sortConfig.key === 'estado' && (
                          <span className="text-indigo-500 text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                      <select 
                        className="w-full text-[10px] py-1 px-1 rounded border border-white/10 bg-[#121c27] text-slate-400 focus:outline-none focus:border-indigo-300"
                        value={colFilterEstado}
                        onChange={e => setColFilterEstado(e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="">Todos</option>
                        <option value="con_compra">Con Compra</option>
                        <option value="sin_compra">Sin Compra</option>
                        <option value="pendiente">Pendiente</option>
                      </select>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[80px] align-top">Verificado</th>
                    <th className="py-3 px-3 text-right rounded-r-xl min-w-[100px] align-top">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                  {paginatedLocales.map(local => {
                    let dotColor = 'bg-[#6d7a72]';
                    if (local.tipo === 'Supermercado') dotColor = 'bg-pink-500';
                    if (local.tipo === 'Distribuidora') dotColor = 'bg-violet-500';
                    if (local.tipo === 'Tienda') dotColor = 'bg-rose-500';
                    if (local.tipo === 'Mini Super') dotColor = 'bg-fuchsia-500';
                    if (local.tipo === 'Restaurante') dotColor = 'bg-orange-500';

                    const resumen = getResumenVisitas(local.id);

                    return (
                      <tr 
                        key={local.id} 
                        className={`hover:bg-white/5 transition-colors ${selectedLocales.find(l => l.id === local.id) ? 'bg-indigo-500/10' : ''} ${!local.activo ? 'opacity-50 grayscale' : ''}`}
                      >
                        <td 
                          className="py-3.5 px-3 font-semibold flex items-center gap-3 cursor-pointer"
                          onClick={() => toggleLocalSelection(local)}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`}></span>
                          
                          {local.foto_url ? (
                            <img src={local.foto_url} alt={local.nombre_local} className="w-8 h-8 rounded-full object-cover shrink-0 bg-white/10 border border-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                              <MapPin className="w-4 h-4 text-slate-400" />
                            </div>
                          )}

                          <div className="flex flex-col">
                            <span className="block font-bold">{local.nombre_local}</span>
                            <span className="text-xs text-slate-400">{local.tipo}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                           {local.vendedor_id ? (
                             <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded-full uppercase flex items-center w-fit gap-1.5">
                               {vendedores.find(v => v.id === local.vendedor_id)?.nombre.split(' ')[0] || 'Vendedor'}
                             </span>
                           ) : (
                             <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-full uppercase flex items-center w-fit gap-1.5">
                               Sin Asignar
                             </span>
                           )}
                        </td>
                        <td className="py-3.5 px-3 cursor-pointer" onClick={() => toggleLocalSelection(local)}>
                           {resumen ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${resumen.mejorEstado === 'con_compra' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {resumen.mejorEstado === 'con_compra' ? 'Con Compra' : 'Sin Compra'}
                              </span>
                              {resumen.count > 1 && (
                                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded w-fit">
                                  {resumen.count} visitas
                                </span>
                              )}
                            </div>
                           ) : (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/10 text-slate-500 whitespace-nowrap">Pendiente</span>
                           )}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {local.verificado && (
                            <span title="Verificado" className="inline-flex justify-center">
                              <BadgeCheck className="w-5 h-5 text-blue-400 mx-auto" />
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right flex items-center justify-end gap-1">
                          <button 
                            onClick={() => { setLocalAEditar(local); setShowLocalModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/200/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEliminarLocal(local.id)}
                            disabled={isPending}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-500/200/20 rounded-lg transition-colors disabled:opacity-50"
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
                    className="px-3 py-1.5 text-xs font-semibold bg-white/10 text-slate-400 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white/10 text-slate-400 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
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
                className="mt-4 w-full py-2.5 text-xs font-bold text-indigo-400 bg-indigo-500/20 hover:bg-indigo-500/200/200/20 rounded-xl transition-colors"
              >
                {showAll ? 'Mostrar Paginado' : 'Mostrar Todos'}
              </button>
            )}

          </div>
        </div>

        {/* Tabla de Historial de Visitas */}
        <div className="bg-[#121c27] rounded-2xl p-4 sm:p-6 shadow-sm border border-white/5 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-200">Registros de Visitas</h3>
                <p className="text-sm text-[#3d4a42]">Historial de visitas realizadas este mes</p>
              </div>
              <button 
                onClick={() => { setVisitaAEditar(null); setShowVisitaModal(true); }}
                className="inline-flex items-center justify-center gap-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/200/200/20 px-3 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Registrar Visita
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-3 rounded-l-xl min-w-[150px]">Fecha / Vendedor</th>
                    <th className="py-3 px-3 min-w-[200px]">Local</th>
                    <th className="py-3 px-3 min-w-[100px]">Orden</th>
                    <th className="py-3 px-3 text-center">Verificado</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right rounded-r-xl min-w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm text-slate-200">
                  {visitasMostradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {(fechaDesde || fechaHasta) ? 'No hay visitas registradas en este periodo.' : 'No hay visitas registradas este mes.'}
                      </td>
                    </tr>
                  ) : (
                    visitasMostradas.map(visita => (
                      <tr key={visita.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3">
                          <span className="block font-bold">{new Date(visita.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                          <span className="text-xs text-slate-400">{visita.vendedor?.nombre}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="block font-bold">{visita.local?.nombre_local}</span>
                          <span className="text-xs text-slate-400">{visita.local?.tipo}</span>
                        </td>
                        <td className="py-3 px-3">
                          {visita.orden_pedido ? (
                            <span className="font-mono text-sm text-slate-300">N° {visita.orden_pedido}</span>
                          ) : (
                            <span className="text-slate-600 font-bold">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {visita.local?.verificado ? (
                            <div className="flex justify-center">
                              <BadgeCheck className="w-5 h-5 text-blue-400" />
                            </div>
                          ) : (
                            <div className="flex justify-center text-slate-600 font-bold">-</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${visita.estado_visita === 'con_compra' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {visita.estado_visita === 'con_compra' ? 'Con Compra' : 'Sin Compra'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right flex items-center justify-end gap-1">
                          <button 
                            onClick={() => { setVisitaAEditar(visita); setShowVisitaModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/200/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEliminarVisita(visita.id)}
                            disabled={isPending}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-500/200/20 rounded-lg transition-colors disabled:opacity-50"
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
          localInicial={selectedLocales.length > 0 ? selectedLocales[0] : null}
          visitaAEditar={visitaAEditar}
          onClose={() => { setShowVisitaModal(false); setVisitaAEditar(null); }}
        />
      )}

      {showLocalModal && (
        <ModalLocal 
          localAEditar={localAEditar}
          vendedores={vendedores}
          onClose={() => { setShowLocalModal(false); setLocalAEditar(null); }}
          onOptimisticUpdate={(data) => addOptimisticLocal(data as Local)}
        />
      )}
    </div>
  );
}
