'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Edit3, PlusCircle, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLogTableProps {
  initialLogs: any[];
}

export function AuditLogTable({ initialLogs }: AuditLogTableProps) {
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const supabase = createClient();

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel('public:audit_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        async (payload) => {
          // Fetch user details for the new log
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
          // Prepend new log
          setLogs(prev => [newLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'DELETE': return { label: 'ELIMINÓ', color: 'bg-rose-100 text-rose-700', icon: <Trash2 className="w-4 h-4 text-rose-600" /> };
      case 'UPDATE': return { label: 'ACTUALIZÓ', color: 'bg-indigo-100 text-indigo-700', icon: <Edit3 className="w-4 h-4 text-indigo-600" /> };
      case 'INSERT': return { label: 'CREÓ', color: 'bg-emerald-100 text-emerald-700', icon: <PlusCircle className="w-4 h-4 text-emerald-600" /> };
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
      'vehicle_maintenance': 'Mantenimiento de Vehículos'
    };
    return names[name] || name;
  };

  const getRecordDescription = (log: any) => {
    const data = log.action === 'DELETE' ? log.old_data : log.new_data;
    if (!data) return 'Registro desconocido';
    
    const title = data.description || data.name || data.title || data.concept || 'Registro sin nombre';
    const amount = data.amount || data.amount_paid || data.target_amount || data.cost || 0;
    
    return (
      <span>
        {log.action === 'DELETE' ? 'Registro suprimido' : log.action === 'UPDATE' ? 'Modificación en' : 'Nuevo registro creado'}: <strong className="text-slate-900">«{title}»</strong>
        {amount > 0 && <span> con valor de <strong className="text-emerald-700">B/. {amount.toFixed(2)}</strong></span>}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 gap-4">
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
      </div>

      {/* Table/List */}
      <div className="divide-y divide-slate-100">
        {logs.map((log) => {
          const info = getActionInfo(log.action);
          const userName = log.profiles?.first_name || log.profiles?.email || 'Sistema';
          const date = new Date(log.created_at);
          
          return (
            <div key={log.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${info.color.replace('text-', 'bg-').replace('100', '100/50')}`}>
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
    </div>
  );
}
