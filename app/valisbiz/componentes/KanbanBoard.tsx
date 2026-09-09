'use client';

import { useState } from 'react';
import { updateTareaEstado } from '../acciones/dashboard';
import type { Tarea, EstadoTarea } from '@/types/valisbiz';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, AlertTriangle, Package, Car, Store, CheckCircle, Cloud, Clock } from 'lucide-react';

interface KanbanBoardProps {
  initialTareas: Tarea[];
}

export default function KanbanBoard({ initialTareas }: KanbanBoardProps) {
  const [tareas, setTareas] = useState<Tarea[]>(initialTareas);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const columnas: { id: EstadoTarea; title: string; colorClass: string; dotClass: string }[] = [
    { id: 'por_hacer', title: 'Por Hacer', colorClass: 'bg-[#f2f3ff]', dotClass: 'bg-[#bccac0]' },
    { id: 'en_ruta', title: 'En Ruta', colorClass: 'bg-[#f2f3ff]', dotClass: 'bg-[#4648d4]' },
    { id: 'completado', title: 'Completado', colorClass: 'bg-[#f2f3ff]', dotClass: 'bg-[#006948]' }
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, nuevoEstado: EstadoTarea) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id || id === '') return;

    // Actualización optimista
    setTareas(prev => prev.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
    
    // Server Action
    const result = await updateTareaEstado(id, nuevoEstado);
    if (!result.success) {
      // Revertir si hay error
      setTareas([...initialTareas]);
      alert("Error al actualizar la tarea: " + result.error);
    }
  };

  const renderIcon = (tipo: string) => {
    switch(tipo) {
      case 'ruta_critica': return <AlertTriangle className="w-5 h-5 text-[#006948]" />;
      case 'inventario': return <Package className="w-5 h-5" />;
      case 'coaching': return <Car className="w-5 h-5 text-[#4648d4]" />;
      case 'trade_marketing': return <Store className="w-5 h-5 text-[#006948]" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const renderBadge = (tipo: string) => {
    switch(tipo) {
      case 'ruta_critica': return <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-xs font-semibold">Urgente</span>;
      case 'inventario': return <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#3d4a42] text-xs font-semibold">Inventario</span>;
      case 'coaching': return <span className="px-2 py-0.5 rounded bg-[#e1e0ff] text-[#07006c] text-xs font-semibold">Coaching</span>;
      case 'trade_marketing': return <span className="px-2 py-0.5 rounded bg-[#adedd3] text-[#306d58] text-xs font-semibold">Trade Mkt</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kanban Board (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#131b2e]">Tablero Operativo de Supervisión</h2>
              <p className="text-sm text-[#3d4a42]">Flujo en tiempo real para mercaderistas y rutas</p>
            </div>
            <span className="bg-[#eaedff] px-3 py-1 rounded-full font-mono text-sm text-[#006948] font-semibold">
              {tareas.filter(t => t.estado !== 'completado').length} Tareas Activas
            </span>
          </div>

          {/* 3 Columns Kanban */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {columnas.map(col => {
              const columnTareas = tareas.filter(t => t.estado === col.id);
              
              return (
                <div 
                  key={col.id}
                  className={`${col.colorClass} rounded-2xl p-4 flex flex-col gap-3 min-h-[300px] transition-colors border border-transparent`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-bold text-[#131b2e] flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotClass}`}></span> {col.title}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-white font-mono text-xs font-bold flex items-center justify-center shadow-sm">
                      {columnTareas.length}
                    </span>
                  </div>

                  {columnTareas.map(tarea => (
                    <div 
                      key={tarea.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tarea.id)}
                      className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 cursor-grab active:cursor-grabbing border-l-4 ${tarea.estado === 'en_ruta' ? 'border-[#4648d4]' : 'border-transparent'} ${tarea.estado === 'completado' ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        {renderBadge(tarea.tipo_tarea)}
                        <span className="font-mono text-xs text-[#3d4a42]">{new Date(tarea.fecha_programada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <h4 className={`text-sm font-bold text-[#131b2e] ${tarea.estado === 'completado' ? 'line-through text-[#3d4a42]' : ''}`}>
                        {tarea.titulo_tarea}
                      </h4>
                      <p className="text-xs text-[#3d4a42] line-clamp-2">{tarea.descripcion}</p>
                      <div className="pt-2 flex items-center justify-between text-xs text-[#3d4a42]">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-4 h-4" /> 
                          {tarea.vendedor?.nombre?.split(' ')[0] || 'Asignado'}
                        </span>
                        {tarea.estado === 'completado' ? (
                          <CheckCircle className="w-5 h-5 text-[#006948]" />
                        ) : (
                          renderIcon(tarea.tipo_tarea)
                        )}
                      </div>
                    </div>
                  ))}
                  {columnTareas.length === 0 && (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm py-8">
                      Arrastrar aquí
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Widget (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#131b2e]">Calendario Supervisor</h3>
                <span className="text-sm text-[#3d4a42]">Octubre 2024 • Cortes 15 y 30</span>
              </div>
              <div className="flex items-center gap-1 text-[#3d4a42]">
                <button className="p-1 rounded-lg hover:bg-[#eaedff]"><ChevronLeft className="w-5 h-5" /></button>
                <button className="p-1 rounded-lg hover:bg-[#eaedff]"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            
            {/* Calendar Mock */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs mb-2 text-[#3d4a42] font-semibold">
              <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span className="text-[#ba1a1a]">Sá</span><span className="text-[#ba1a1a]">Do</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-sm">
              <span className="p-2 text-[#bccac0]">29</span>
              <span className="p-2 text-[#bccac0]">30</span>
              <span className="p-2 rounded-lg hover:bg-[#eaedff] cursor-pointer">1</span>
              <span className="p-2 rounded-lg hover:bg-[#eaedff] cursor-pointer">2</span>
              <span className="p-2 rounded-lg hover:bg-[#eaedff] cursor-pointer">3</span>
              <span className="p-2 rounded-lg hover:bg-[#eaedff] cursor-pointer">4</span>
              <span className="p-2 rounded-lg hover:bg-[#eaedff] cursor-pointer">5</span>
              {/* Más días omitidos por brevedad, mostrando los críticos */}
              <span className="p-2 rounded-lg hover:bg-[#eaedff] cursor-pointer">14</span>
              <span className="p-2 bg-[#ba1a1a] text-white font-bold rounded-xl cursor-pointer shadow-sm relative group" title="Corte Quincenal 15">
                15
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ffdad6] rounded-full"></span>
              </span>
              <span className="p-2 rounded-lg hover:bg-[#eaedff] cursor-pointer">16</span>
              <span className="col-span-4">...</span>
              <span className="p-2 bg-[#006948] text-white font-bold rounded-xl cursor-pointer shadow-sm relative" title="Corte Final de Mes">
                30
              </span>
              <span className="p-2 text-[#bccac0]">31</span>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <div className="flex items-center gap-3 p-2.5 bg-[#f2f3ff] rounded-xl">
                <span className="w-3 h-3 rounded-full bg-[#ba1a1a] flex-shrink-0"></span>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-[#131b2e]">15 Oct • Corte Quincenal 1</span>
                  <span className="text-xs text-[#3d4a42]">Auditoría al 50% de cuotas vendedores</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-[#f2f3ff] rounded-xl">
                <span className="w-3 h-3 rounded-full bg-[#006948] flex-shrink-0"></span>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-[#131b2e]">30 Oct • Cierre Mensual Keiko</span>
                  <span className="text-xs text-[#3d4a42]">Liquidación de incentivos y bonos</span>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-6 w-full py-2.5 rounded-xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Agendar Visita en Terreno</span>
          </button>
        </div>
      </div>
    </div>
  );
}
