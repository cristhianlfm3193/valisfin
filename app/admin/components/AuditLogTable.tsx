'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Edit3, PlusCircle, Activity, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const translateKey = (key: string) => {
  const dictionary: Record<string, string> = {
    id: 'ID',
    title: 'Título',
    name: 'Nombre',
    description: 'Descripción',
    concept: 'Concepto',
    amount: 'Monto',
    amount_paid: 'Monto Pagado',
    target_amount: 'Monto Objetivo',
    saved_amount: 'Monto Ahorrado',
    cost: 'Costo',
    category: 'Categoría',
    priority: 'Prioridad',
    deadline_date: 'Fecha Límite',
    date: 'Fecha',
    date_expected: 'Fecha Esperada',
    created_at: 'Creado el',
    user_id: 'ID Usuario',
    profile_id: 'ID Perfil'
  };
  return dictionary[key] || key;
};

const formatValue = (key: string, value: any) => {
  if (value === null || value === undefined) return <span className="text-slate-400 italic">Vacío</span>;
  
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }
  
  if (key.includes('amount') || key === 'cost') {
    return <span className="text-emerald-600 font-bold">B/. {Number(value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>;
  }
  
  if (key.includes('date') || key === 'created_at') {
    try {
      return format(new Date(value), "PPP", { locale: es });
    } catch (e) {
      return String(value);
    }
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const DataViewer = ({ data }: { data: any }) => {
  if (!data) return null;
  // Ocultamos algunos campos internos que no aportan valor visual al humano, pero mostramos los datos reales
  const entries = Object.entries(data).filter(([key]) => key !== 'id' && !key.endsWith('_id') && key !== 'created_at'); 
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-inner mt-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{translateKey(key)}</span>
          <span className="text-sm font-medium text-slate-800 break-words">{formatValue(key, value)}</span>
        </div>
      ))}
    </div>
  );
};

interface AuditLogTableProps {

  initialLogs: any[];
}

export function AuditLogTable({ initialLogs }: AuditLogTableProps) {
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const itemsPerPage = 10;
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:audit_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        async (payload) => {
          const newLog = payload.new;
          if (newLog.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, email, avatar_url')
              .eq('id', newLog.user_id)
              .single();
            if (profile) {
              newLog.profiles = profile;
            }
          }
          setLogs(prev => [newLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Filtering Logic
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const userName = log.profiles?.first_name || log.profiles?.email || 'Sistema';
    const table = formatTableName(log.table_name);
    return userName.toLowerCase().includes(q) || table.toLowerCase().includes(q) || log.action.toLowerCase().includes(q);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'DELETE': return { label: 'ELIMINÓ', color: 'bg-rose-100 text-rose-700', icon: <Trash2 className="w-4 h-4 text-rose-600" /> };
      case 'UPDATE': return { label: 'ACTUALIZÓ', color: 'bg-indigo-100 text-indigo-700', icon: <Edit3 className="w-4 h-4 text-indigo-600" /> };
      case 'INSERT': return { label: 'CREÓ', color: 'bg-emerald-100 text-emerald-700', icon: <PlusCircle className="w-4 h-4 text-emerald-600" /> };
      case 'LOGIN': return { label: 'INICIO SESIÓN', color: 'bg-blue-100 text-blue-700', icon: <Activity className="w-4 h-4 text-blue-600" /> };
      case 'LOGOUT': return { label: 'CERRÓ SESIÓN', color: 'bg-slate-100 text-slate-700', icon: <Activity className="w-4 h-4 text-slate-600" /> };
      default: return { label: action, color: 'bg-slate-100 text-slate-700', icon: <Activity className="w-4 h-4 text-slate-600" /> };
    }
  };

  const formatTableName = (name: string) => {
    const names: Record<string, string> = {
      'daily_expenses': 'Gastos Diarios',
      'incomes': 'Ingresos',
      'savings_goals': 'Metas de Ahorro',
      'fixed_payments': 'Pagos Fijos Mensuales',
      'vehicles': 'Vehículos',
      'vehicle_maintenance': 'Mantenimiento de Vehículos',
      'auth': 'Autenticación'
    };
    return names[name] || name;
  };

  const getRecordDescription = (log: any) => {
    if (log.action === 'LOGIN') return <span>Inició sesión exitosamente en el sistema.</span>;
    if (log.action === 'LOGOUT') return <span>Cerró sesión del sistema.</span>;
    
    const data = log.action === 'DELETE' ? log.old_data : log.new_data;
    if (!data) return 'Registro desconocido';
    
    const title = data.description || data.name || data.title || data.concept || 'Registro sin nombre';
    const amount = data.amount || data.amount_paid || data.target_amount || data.cost || 0;
    
    return (
      <span>
        {log.action === 'DELETE' ? 'Registro suprimido' : log.action === 'UPDATE' ? 'Modificación en' : 'Nuevo registro creado'}: <strong className="text-slate-900">«{title}»</strong>
        {amount > 0 && <span> con valor de <strong className="text-emerald-700">B/. {amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></span>}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Registro de Auditoría Detallado en Vivo
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </h3>
              <p className="text-sm text-slate-500">Sincronizado vía Supabase Realtime</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
              placeholder="Buscar por usuario, acción o tabla..."
            />
          </div>
        </div>

        {/* Table/List */}
        <div className="divide-y divide-slate-100">
          {currentLogs.map((log) => {
            const info = getActionInfo(log.action);
            const userName = log.profiles?.first_name || log.profiles?.email || 'Sistema';
            const date = new Date(log.created_at);
            
            return (
              <div 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center cursor-pointer group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${info.color.replace('text-', 'bg-').replace('100', '100/50')} group-hover:scale-105 transition-transform`}>
                  {info.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold tracking-wide ${info.color}`}>
                      {info.label}
                    </span>
                    <span className="text-slate-600 font-medium">{userName}</span>
                    <span className="text-slate-400">en</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {formatTableName(log.table_name)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-700 leading-relaxed mb-1.5">
                    {getRecordDescription(log)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {format(date, "d MMM, hh:mm a", { locale: es })}
                      </span>
                      <span className="hidden sm:inline text-slate-300">•</span>
                      <span className="hidden sm:inline font-mono text-[10px]">ID: #{log.id.substring(0, 8)}</span>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      Ver Detalles
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {logs.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Activity className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No hay registros de auditoría recientes.</p>
              <p className="text-sm mt-1">Los cambios en las tablas se mostrarán aquí en vivo.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs font-medium text-slate-500">
            Mostrando {filteredLogs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length} eventos
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-700 min-w-[2rem] text-center">
              {currentPage}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedLog(null)}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 transform transition-all flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Detalles de Auditoría</h3>
                <p className="text-sm text-slate-500 mt-1 font-mono text-xs">ID: {selectedLog.id}</p>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-6">
              
              <div className="flex flex-wrap gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Acción</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold tracking-wide text-xs ${getActionInfo(selectedLog.action).color}`}>
                    {getActionInfo(selectedLog.action).label}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tabla</span>
                  <span className="font-medium text-slate-700">{formatTableName(selectedLog.table_name)}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Fecha</span>
                  <span className="font-medium text-slate-700">{format(new Date(selectedLog.created_at), "PPP, p", { locale: es })}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Usuario</span>
                  <span className="font-medium text-slate-700">{selectedLog.profiles?.first_name || selectedLog.profiles?.email || 'Sistema'}</span>
                </div>
              </div>


              {selectedLog.old_data && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Datos Anteriores
                  </h4>
                  <DataViewer data={selectedLog.old_data} />
                </div>
              )}

              {selectedLog.new_data && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {selectedLog.action === 'UPDATE' ? 'Datos Nuevos' : 'Datos del Registro'}
                  </h4>
                  <DataViewer data={selectedLog.new_data} />
                </div>
              )}</div>
          </div>
        </div>
      )}
    </>
  );
}
