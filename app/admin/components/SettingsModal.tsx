'use client';

import { useState } from 'react';
import { updateAppSettings } from '@/app/actions/admin';
import { X, Save, Image as ImageIcon, Type, Link as LinkIcon, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: any;
  onSaved: () => void;
}

export function SettingsModal({ isOpen, onClose, currentSettings, onSaved }: SettingsModalProps) {
  const [imageUrl, setImageUrl] = useState(currentSettings?.imageUrl || '');
  const [welcomeTitle, setWelcomeTitle] = useState(currentSettings?.welcomeTitle || '');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(currentSettings?.welcomeSubtitle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const newSettings = { imageUrl, welcomeTitle, welcomeSubtitle };
      const res = await updateAppSettings('login_page', newSettings);
      if (res.success) {
        onSaved();
        onClose();
      } else {
        setError(res.error || 'Error al guardar configuración');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Personalizar Pantalla de Inicio</h3>
            <p className="text-sm text-slate-500 mt-1">Configura la foto y el mensaje de bienvenida de ValisFin.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Photo Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Foto de Portada</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 block">Enlace de la imagen (URL)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  placeholder="https://ejemplo.com/mifoto.jpg"
                />
              </div>
              {imageUrl && (
                <div className="mt-3 relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover object-center" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          {/* Texts Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Type className="w-4 h-4 text-emerald-600" />
              <span>Textos de Bienvenida</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 block">Título Principal</label>
              <input
                type="text"
                value={welcomeTitle}
                onChange={(e) => setWelcomeTitle(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 font-medium"
                placeholder="Ej. Construyendo el patrimonio de nuestra familia..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 block">Mensaje / Cita</label>
              <textarea
                value={welcomeSubtitle}
                onChange={(e) => setWelcomeSubtitle(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 resize-none"
                placeholder="Ej. Cada balboa cuidado es un paso firme..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-black transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
