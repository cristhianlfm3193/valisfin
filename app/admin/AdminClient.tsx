'use client';

import { useState } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { UsersModal } from './components/UsersModal';
import { LayoutDashboard, Users, Image as ImageIcon, Shield, ArrowRight, Activity, Database, Lock } from 'lucide-react';
import Link from 'next/link';

interface AdminClientProps {
  initialSettings: any;
  initialUsers: any[];
}

export default function AdminClient({ initialSettings, initialUsers }: AdminClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

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

      <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 rounded-xl shadow-sm">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Panel de Control</h1>
            </div>
            <p className="text-sm text-slate-500">Gestión centralizada de la plataforma ValisFin.</p>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Volver al Dashboard</span>
          </Link>
        </header>

        {/* Stats Row (Decorative/Placeholder for future) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Estado del Sistema</p>
              <p className="text-sm font-bold text-slate-900">Óptimo</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Usuarios Totales</p>
              <p className="text-sm font-bold text-slate-900">{initialUsers.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Base de Datos</p>
              <p className="text-sm font-bold text-slate-900">Conectada</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Seguridad</p>
              <p className="text-sm font-bold text-slate-900">Nivel Máximo</p>
            </div>
          </div>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: Apariencia */}
          <div className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <ImageIcon className="w-32 h-32 text-emerald-600" />
            </div>
            
            <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                <ImageIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Apariencia de la App</h2>
              <p className="text-sm text-slate-500 mb-8 flex-1">
                Personaliza la foto de portada, el mensaje de bienvenida y el estilo visual de la pantalla de inicio de sesión para tu familia.
              </p>
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center justify-between w-full px-5 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
              >
                <span>Editar Pantalla de Inicio</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card: Usuarios y Roles */}
          <div className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="absolute top-0 right-0 p-6 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <Users className="w-32 h-32 text-slate-900" />
            </div>
            
            <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-10">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-200">
                <Users className="w-6 h-6 text-slate-700" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Gestión de Usuarios</h2>
              <p className="text-sm text-slate-500 mb-8 flex-1">
                Controla los permisos de acceso. Asigna o revoca privilegios de administrador a los miembros de la plataforma.
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

        </div>
      </div>
    </main>
  );
}
