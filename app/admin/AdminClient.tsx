'use client';

import { useState } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { UsersModal } from './components/UsersModal';
import { ValisBizSettingsModal } from './components/ValisBizSettingsModal';
import { AuditLogTable } from './components/AuditLogTable';
import { LayoutDashboard, Users, Image as ImageIcon, Shield, ArrowRight, Activity, Database, Lock, Server, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Btn3D } from '@/app/components/Btn3D';

interface AdminClientProps {
  initialSettings: any;
  initialUsers: any[];
  initialLogs: any[];
  vendedores?: any[];
}

export default function AdminClient({ initialSettings, initialUsers, initialLogs, vendedores = [] }: AdminClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isValisBizOpen, setIsValisBizOpen] = useState(false);

  const loginImageUrl = initialSettings?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuB58d3sZphwVWt6fY1zPpSOxEQ-bPt4YS2Dm1VY099OvbywhQIaI7Csiq1BenqPYc90MpRW5VmE_-xGkNe7UzuREoZ9E2yVMR0NAdaQ1S7cTNVbwWUXIIdqfsjGSKkNWaqW9gJoaSVtuBa0847SuZueapEkFp4dbqzafxYhhfTOvLofTPdeAqQcwpbMzM6dm2e-Luvjtet4aLuqSiFs37NtsGdiKhurGWRXJic0OJOcd5GRoU9ivTIxhCmpR5PxmXttSQ";

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 sm:p-6 lg:p-8 font-['Plus_Jakarta_Sans'] pb-24 lg:pb-8">
      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentSettings={initialSettings} 
        onSaved={() => window.location.reload()} 
      />
      
      <UsersModal 
        isOpen={isUsersOpen} 
        onClose={() => setIsUsersOpen(false)} 
        users={initialUsers} 
        onSaved={() => window.location.reload()} 
      />

      <ValisBizSettingsModal
        isOpen={isValisBizOpen}
        onClose={() => setIsValisBizOpen(false)}
        vendedores={vendedores}
        onSaved={() => window.location.reload()}
      />

      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 rounded-xl shadow-sm">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Panel de Control</h1>
            </div>
            <p className="text-sm text-slate-500">Gestión centralizada y auditoría de ValisFin.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Btn3D color="pink" onClick={() => setIsValisBizOpen(true)}>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Configuración ValisBiz</span>
              </span>
            </Btn3D>

            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wider uppercase">Base de Datos (Gratis)</p>
              <Database className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">Almacenamiento 500 MB</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-700 leading-none">&lt; 1%</span>
              <span className="text-xs text-slate-500 font-medium mb-0.5">uso aprox.</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wider uppercase">Autenticación (Auth)</p>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">Límite 50,000 MAU</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 leading-none">{initialUsers.length}</span>
              <span className="text-xs text-emerald-600 font-medium mb-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">Óptimo</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wider uppercase">Seguridad y Accesos</p>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">Cuentas Registradas</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 leading-none">{initialUsers.length}</span>
              <span className="text-xs text-slate-500 font-medium mb-0.5">miembros activos</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wider uppercase">Actividad Reciente</p>
              <Activity className="w-4 h-4 text-slate-700" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">Operaciones DB</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 leading-none">{initialLogs.length}+</span>
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
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
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
          <div className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="absolute top-6 right-6 flex -space-x-3 transition-transform duration-500 group-hover:-translate-x-1">
              {initialUsers.slice(0, 3).map((u, i) => (
                <div key={u.id} className="w-9 h-9 rounded-full border-[3px] border-white overflow-hidden shadow-sm hover:scale-110 relative z-10 transition-all bg-white" style={{ zIndex: 10 - i }}>
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                      {(u.first_name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-6 flex-1 flex flex-col relative z-10">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-200">
                <Users className="w-6 h-6 text-slate-700" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Gestión de Usuarios</h2>
              <p className="text-sm text-slate-500 mb-6 flex-1">
                Controla permisos de acceso y administra los roles de usuarios registrados.
              </p>
              
              <button 
                onClick={() => setIsUsersOpen(true)}
                className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span>Administrar Roles</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card: Configuración ValisBiz */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950 rounded-3xl border border-pink-900/40 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="p-6 flex-1 flex flex-col relative z-10">
              <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-pink-400/30 text-pink-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Configuración ValisBiz</h2>
              <p className="text-sm text-pink-100/80 mb-6 flex-1">
                Gestiona perfiles de vendedores, metas mensuales y asignación de reemplazos temporales (Vacaciones).
              </p>
              
              <Btn3D color="pink" onClick={() => setIsValisBizOpen(true)} fullWidth>
                <span className="flex items-center justify-center gap-2">
                  <span>Gestionar Vendedores y Metas</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Btn3D>
            </div>
          </div>

        </div>

        {/* Audit Logs Table */}
        <AuditLogTable initialLogs={initialLogs} />

      </div>
    </main>
  );
}
