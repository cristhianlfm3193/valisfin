'use client';

import { useState } from 'react';
import { updateUserRole } from '@/app/actions/admin';
import { X, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  onSaved: () => void;
}

export function UsersModal({ isOpen, onClose, users, onSaved }: UsersModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
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

                  <div className="flex items-center gap-3 pl-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isAdmin 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                    
                    <button
                      onClick={() => handleToggleRole(user.id, user.role)}
                      disabled={isLoading}
                      className={`p-2 rounded-xl transition-all ${
                        isAdmin 
                          ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                          : 'text-slate-400 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-600'
                      } disabled:opacity-50`}
                      title={isAdmin ? "Quitar rol de administrador" : "Hacer administrador"}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isAdmin ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <ShieldAlert className="w-4 h-4" />
                      )}
                    </button>
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
