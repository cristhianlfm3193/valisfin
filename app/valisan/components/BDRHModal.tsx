'use client';

import { X, User, Shield, Briefcase, MapPin, Calendar, FileText, BadgeDollarSign, AlignLeft, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BDRHModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: any | null;
  mode: 'view' | 'edit';
  onSave?: (updatedPerson: any) => Promise<void>;
}

export default function BDRHModal({ isOpen, onClose, person, mode, onSave }: BDRHModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (person) {
      setFormData({ ...person });
    }
  }, [person]);

  if (!mounted || !isOpen || !person || !formData) return null;

  const isEdit = mode === 'edit';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      await onSave(formData);
      setIsSaving(false);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-[#0a1426] border border-sky-500/30 rounded-3xl w-full max-w-4xl shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-sky-500/20 bg-slate-900/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEdit ? 'Editar Personal' : 'Detalles de Personal'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">Posición: {formData.pos_id || 'N/A'}</span>
                <span>• {formData.rango}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-sky-500/20 scrollbar-track-transparent">
          
          {/* Fila de Tarjetas Superiores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Info Personal */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4 text-sky-400 font-medium text-sm">
                <User className="w-4 h-4" />
                Información Personal
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nombre</label>
                    {isEdit ? (
                      <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-sky-500/50" />
                    ) : (
                      <p className="text-slate-300 font-medium">{formData.nombre || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Apellido</label>
                    {isEdit ? (
                      <input type="text" name="apellido" value={formData.apellido || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-sky-500/50" />
                    ) : (
                      <p className="text-slate-300 font-medium">{formData.apellido || 'N/A'}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Cédula</label>
                    {isEdit ? (
                      <input type="text" name="cedula" value={formData.cedula || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-sky-500/50" />
                    ) : (
                      <p className="text-slate-300 font-medium">{formData.cedula || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Género</label>
                    {isEdit ? (
                      <input type="text" name="genero" value={formData.genero || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-sky-500/50" />
                    ) : (
                      <p className="text-slate-300 font-medium">{formData.genero || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Operativa */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4 text-emerald-400 font-medium text-sm">
                <Shield className="w-4 h-4" />
                Información Operativa
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Rango / Cargo</label>
                    {isEdit ? (
                      <input type="text" name="rango" value={formData.rango || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-300 font-medium focus:outline-none focus:border-emerald-500/50" />
                    ) : (
                      <p className="text-emerald-400 font-medium">{formData.rango || formData.cargo || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Estado</label>
                    {isEdit ? (
                      <input type="text" name="estado" value={formData.estado || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/50" />
                    ) : (
                      <p className="text-slate-300 font-medium">{formData.estado || 'N/A'}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Posición (POS_ID)</label>
                    {isEdit ? (
                      <input type="text" name="pos_id" value={formData.pos_id || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/50" />
                    ) : (
                      <p className="text-slate-300 font-medium">{formData.pos_id || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Fecha Inicio</label>
                    {isEdit ? (
                      <input type="date" name="fecha_inicio" value={formData.fecha_inicio || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/50" />
                    ) : (
                      <p className="text-slate-300 font-medium">{formData.fecha_inicio || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Fila Asignaciones */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4 text-purple-400 font-medium text-sm">
              <MapPin className="w-4 h-4" />
              Asignación Actual
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Dirección</label>
                {isEdit ? (
                  <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500/50" />
                ) : (
                  <p className="text-slate-300 font-medium">{formData.direccion || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Departamento</label>
                {isEdit ? (
                  <input type="text" name="departamento" value={formData.departamento || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500/50" />
                ) : (
                  <p className="text-slate-300 font-medium">{formData.departamento || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Grupo PD / Turno</label>
                {isEdit ? (
                  <div className="flex gap-2">
                    <input type="text" name="grupo_pd" value={formData.grupo_pd || ''} onChange={handleChange} placeholder="Grupo" className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500/50" />
                    <input type="text" name="turno" value={formData.turno || ''} onChange={handleChange} placeholder="Turno" className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500/50" />
                  </div>
                ) : (
                  <p className="text-slate-300 font-medium">{formData.grupo_pd || 'N/A'} / {formData.turno || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Datos Financieros (Salario, etc) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4 text-amber-400 font-medium text-sm">
              <BadgeDollarSign className="w-4 h-4" />
              Datos Salariales
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Salario Base</label>
                {isEdit ? (
                  <input type="number" name="salario" value={formData.salario || 0} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500/50" />
                ) : (
                  <p className="text-slate-300 font-medium">${formData.salario || '0.00'}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Sobresueldo</label>
                {isEdit ? (
                  <input type="number" name="sobresueldo" value={formData.sobresueldo || 0} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500/50" />
                ) : (
                  <p className="text-slate-300 font-medium">${formData.sobresueldo || '0.00'}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Objeto de Gasto</label>
                {isEdit ? (
                  <input type="text" name="objeto_gasto" value={formData.objeto_gasto || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500/50" />
                ) : (
                  <p className="text-slate-300 font-medium">{formData.objeto_gasto || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        {isEdit && (
          <div className="p-5 border-t border-sky-500/20 bg-slate-900/80 flex justify-end gap-3 sticky bottom-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition font-medium shadow-lg shadow-sky-500/20 flex items-center gap-2"
            >
              {isSaving ? (
                <>Guardando...</>
              ) : (
                <>Guardar Cambios</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
