'use client';

import { useState } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { UsersModal } from './components/UsersModal';
import { AuditLogTable } from './components/AuditLogTable';
import { AppsModal } from './components/AppsModal';
import { LayoutDashboard, Users, Image as ImageIcon, Shield, ArrowRight, Activity, Database, Lock, Server, Sparkles, Grid } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Btn3D } from '@/app/components/Btn3D';

interface AdminClientProps {
  initialSettings: any;
  initialUsers: any[];
  initialLogs: any[];
  vendedores?: any[];
}

export default function AdminClient({ initialSettings, initialUsers, initialLogs, vendedores = [] }: AdminClientProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);

  const loginImageUrl = initialSettings?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuB58d3sZphwVWt6fY1zPpSOxEQ-bPt4YS2Dm1VY099OvbywhQIaI7Csiq1BenqPYc90MpRW5VmE_-xGkNe7UzuREoZ9E2yVMR0NAdaQ1S7cTNVbwWUXIIdqfsjGSKkNWaqW9gJoaSVtuBa0847SuZueapEkFp4dbqzafxYhhfTOvLofTPdeAqQcwpbMzM6dm2e-Luvjtet4aLuqSiFs37NtsGdiKhurGWRXJic0OJOcd5GRoU9ivTIxhCmpR5PxmXttSQ";

  return (
    <main className="min-h-screen bg-[#090a0f] text-white p-4 sm:p-6 lg:p-8 font-['Plus_Jakarta_Sans'] pb-24 lg:pb-8">
      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentSettings={initialSettings} 
        onSaved={() => router.refresh()} 
      />
      
      <UsersModal 
        isOpen={isUsersOpen} 
        onClose={() => setIsUsersOpen(false)} 
        users={initialUsers} 
        onSaved={() => router.refresh()} 
      />

      <AppsModal 
        isOpen={isAppsOpen} 
        onClose={() => setIsAppsOpen(false)} 
        users={initialUsers} 
        onSaved={() => router.refresh()} 
      />

      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 rounded-xl shadow-sm">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Panel de Control</h1>
            </div>
            <p className="text-sm text-slate-500">Gestión centralizada y auditoría de ValisFin.</p>
          </div>
          

        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#121c27] p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wider uppercase">Base de Datos (Gratis)</p>
              <Database className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-white">Almacenamiento 500 MB</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-700 leading-none">&lt; 1%</span>
              <span className="text-xs text-slate-500 font-medium mb-0.5">uso aprox.</span>
            </div>
          </div>

          <div className="bg-[#121c27] p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wider uppercase">Autenticación (Auth)</p>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-white">Límite 50,000 MAU</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white leading-none">{initialUsers.length}</span>
              <span className="text-xs text-emerald-600 font-medium mb-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">Óptimo</span>
            </div>
          </div>

          <div className="bg-[#121c27] p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wider uppercase">Seguridad y Accesos</p>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-white">Cuentas Registradas</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white leading-none">{initialUsers.length}</span>
              <span className="text-xs text-slate-500 font-medium mb-0.5">miembros activos</span>
            </div>
          </div>

          <div className="bg-[#121c27] p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wider uppercase">Actividad Reciente</p>
              <Activity className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-white">Operaciones DB</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white leading-none">{initialLogs.length}+</span>
              <span className="text-xs text-slate-500 font-medium mb-0.5">transacciones</span>
            </div>
          </div>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: Apariencia */}
          <div className="group relative overflow-hidden bg-slate-900 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col h-full min-h-[280px]">
            {/* Background Image (Real Image from settings) */}
            <div className="absolute inset-0 z-0">
              <img src={loginImageUrl} alt="Background" className="w-full h-full object-cover object-center opacity-40 group-hover:scale-105 group-hover:opacity-30 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col relative z-10">
              <div className="w-12 h-12 bg-[#121c27]/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Apariencia de la App</h2>
              <p className="text-sm text-slate-300 mb-6 flex-1">
                Personaliza la foto de portada y el estilo visual de la pantalla de inicio de sesión.
              </p>
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg"
              >
                <span>Editar Inicio</span>
                <ArrowRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card: Usuarios y Roles */}
          <div className="group relative overflow-hidden bg-[#121c27] rounded-3xl border border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="absolute top-6 right-6 flex -space-x-3 transition-transform duration-500 group-hover:-translate-x-1">
              {initialUsers.slice(0, 3).map((u, i) => (
                <div key={u.id} className="w-9 h-9 rounded-full border-[3px] border-white overflow-hidden shadow-sm hover:scale-110 relative z-10 transition-all bg-[#121c27]" style={{ zIndex: 10 - i }}>
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                      {(u.first_name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-6 flex-1 flex flex-col relative z-10">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Users className="w-6 h-6 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Gestión de Usuarios</h2>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                Controla permisos de acceso y administra los roles de usuarios registrados.
              </p>
              
              <button 
                onClick={() => setIsUsersOpen(true)}
                className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-white/5 text-slate-300 font-semibold rounded-xl hover:bg-white/10 hover:text-white transition-colors border border-white/5 mt-auto"
              >
                <span>Administrar Roles</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-slate-300 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card: Gestión de Apps */}
          <div className="group relative overflow-hidden bg-[#121c27] rounded-3xl border border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col h-full min-h-[280px]">
            <div className="absolute top-6 right-6 flex -space-x-3 transition-transform duration-500 group-hover:-translate-x-1">
              <div className="w-9 h-9 rounded-full border-[3px] border-white overflow-hidden shadow-sm hover:scale-110 relative z-10 transition-all bg-[#121c27] flex items-center justify-center">
                <Grid className="w-4 h-4 text-sky-400" />
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col relative z-20">
              <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Grid className="w-6 h-6 text-sky-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Gestión de Apps</h2>
              <p className="text-sm text-slate-400 mb-6 flex-1">
                Controla permisos de acceso a ValisFin, ValisBiz y ValisAN de forma individual por usuario.
              </p>
              
              <button 
                onClick={() => setIsAppsOpen(true)}
                className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-white/5 text-slate-300 font-semibold rounded-xl hover:bg-white/10 hover:text-white transition-colors border border-white/5 mt-auto"
              >
                <span>Administrar Accesos</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-slate-300 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Audit Logs Table */}
        <AuditLogTable initialLogs={initialLogs} />

      </div>
    </main>
  );
}
