'use client';

import { useState, useRef } from 'react';
import { Sparkles, X, Loader2, Send, Bot } from 'lucide-react';

interface ValisAIAssistantProps {
  onDataParsed: (data: any) => void;
}

export default function ValisAIAssistant({ onDataParsed }: ValisAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    if (!isDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      setIsDragging(true);
    }
    
    if (isDragging) {
      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      dragRef.current = null;
      setTimeout(() => setIsDragging(false), 50);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(true);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/parse-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });
      
      const resText = await res.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch {
        throw new Error('Error de comunicación con el servidor. Por favor intente nuevamente.');
      }
      
      if (!res.ok) {
        throw new Error(data?.error || 'Error procesando el texto');
      }
      
      onDataParsed(data);
      setIsOpen(false);
      setText('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de conexión con ValisAI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {!isOpen ? (
        <button 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleClick}
          style={{ touchAction: 'none' }}
          className="p-4 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-transform group flex items-center justify-center cursor-grab active:cursor-grabbing"
          title="Asistente ValisAI"
        >
          <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      ) : (
        <div className="w-[calc(100vw-2rem)] sm:w-96 bg-[#0a1426] border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right">
          {/* Header */}
          <div 
            className="bg-gradient-to-r from-slate-900 to-[#0a1426] p-4 border-b border-cyan-500/20 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }}
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  ValisAI <Sparkles className="w-3 h-3 text-cyan-400"/>
                </h3>
                <p className="text-[10px] text-slate-400">Arrastra para mover</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-4 space-y-4">
            <p className="text-xs text-slate-300">
              Pega el texto del reporte de WhatsApp aquí y la Inteligencia Artificial rellenará los campos automáticamente por ti.
            </p>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="*DINOA/POLICÍA AEROPORTUARIA...*"
              className="w-full h-48 bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 text-[16px] sm:text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent transition"
            ></textarea>
            
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Analizando...' : 'Generar Formulario'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
