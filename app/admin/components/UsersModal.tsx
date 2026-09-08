'use client';

import { useState } from 'react';
import { updateUserRole, updateUserAccess } from '@/app/actions/admin';
import { X, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  onSaved: () => void;
}

export function UsersModal({ isOpen, onClose, users, onSaved }: UsersModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [accessLoadingId, setAccessLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleToggleRole = async (userId: string, currentRole: string) => {
    setLoadingId(userId);
    setError('');
    try {
      const newRole = currentRole === 'administrador' ? 'usuario' : 'administrador';
      const res = await updateUserRole(userId, newRole);
      
      if (res.success) {
        onSaved();
      } else {
        setError(res.error || 'Error al cambiar el rol');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleAccess = async (userId: string, currentIsActive: boolean) => {
    setAccessLoadingId(userId);
    setError('');
    try {
      const res = await updateUserAccess(userId, !currentIsActive);
      if (res.success) {
        onSaved();
      } else {
        setError(res.error || 'Error al cambiar el acceso');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccessLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h3>
            <p className="text-sm text-slate-500 mt-1">Controla quién tiene acceso de administrador en ValisFin.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {users.map((user) => {
              const isAdmin = user.role === 'administrador';
              const isLoading = loadingId === user.id;

              return (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 shrink-0">
                        {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {user.first_name || 'Sin nombre'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pl-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isAdmin 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                    
                    <div className="flex flex-col gap-3">
                      {/* Role Toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Admin</span>
                        <button
                          type="button"
                          onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out disabled:opacity-50 ${
                        isAdmin ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                      role="switch"
                      aria-checked={isAdmin}
                    >
                      <span className="sr-only">Toggle admin role</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                          isAdmin ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      >
                          {isLoading && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
                        </span>
                      </button>
                    </div>
                    
                    {/* Access Toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Acceso</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAccess(user.id, user.is_active)}
                        disabled={accessLoadingId === user.id}
                        title={user.is_active ? "Denegar acceso a la app" : "Permitir acceso a la app"}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out disabled:opacity-50 ${
                          user.is_active ? 'bg-emerald-500' : 'bg-red-400'
                        }`}
                        role="switch"
                        aria-checked={user.is_active}
                      >
                        <span className="sr-only">Toggle App Access</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                            user.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        >
                          {accessLoadingId === user.id && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {users.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-8">No se encontraron usuarios.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-black transition-colors shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
