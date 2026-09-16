'use client';

import { useState } from 'react';
import { updateUserAppAccess } from '@/app/actions/admin';
import { X, Loader2, LayoutDashboard } from 'lucide-react';

interface AppsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
  onSaved: () => void;
}

export function AppsModal({ isOpen, onClose, users, onSaved }: AppsModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleToggleApp = async (userId: string, currentAccess: string[], appToToggle: string) => {
    setLoadingId(userId + '-' + appToToggle);
    setError('');
    try {
      const accessArray = currentAccess || ['valisfin', 'valisbiz', 'valisan', 'valisven'];
      let newAccess: string[];
      if (accessArray.includes(appToToggle)) {
        newAccess = accessArray.filter(app => app !== appToToggle);
      } else {
        newAccess = [...accessArray, appToToggle];
      }
      
      const res = await updateUserAppAccess(userId, newAccess);
      
      if (res.success) {
        onSaved();
      } else {
        setError(res.error || 'Error al cambiar el acceso');
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
      
      <div className="relative bg-[#121c27] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-white/10 transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5/50">
          <div>
            <h3 className="text-xl font-bold text-white">Gestión de Apps</h3>
            <p className="text-sm text-slate-500 mt-1">Controla a qué aplicaciones tiene acceso cada usuario.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-400 p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#121c27]">
          {error && (
            <div className="p-3 mb-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {users.map((user) => {
              const accessArray = user.app_access || ['valisfin', 'valisbiz', 'valisan', 'valisven'];

              return (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors gap-4">
                  <div className="flex items-center gap-4 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 shrink-0">
                        {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {user.first_name || 'Sin nombre'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {['valisfin', 'valisbiz', 'valisan', 'valisven'].map(app => {
                      const hasAccess = accessArray.includes(app);
                      const isLoading = loadingId === `${user.id}-${app}`;
                      return (
                        <div key={app} className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{app.replace('valis', '')}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleApp(user.id, accessArray, app)}
                            disabled={isLoading}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent focus:outline-none transition-colors duration-200 ease-in-out disabled:opacity-50 ${
                              hasAccess ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none absolute left-0 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                                hasAccess ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            >
                              {isLoading && <Loader2 className="w-2 h-2 text-slate-400 animate-spin" />}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
