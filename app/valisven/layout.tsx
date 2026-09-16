import { ValisVenSidebar } from './components/ValisVenSidebar';
import { ValisVenHeader } from './components/ValisVenHeader';

export const metadata = {
  title: 'ValisVen - Sistema Operativo de Ventas',
  description: 'Gestión de licencias y ventas de ValisHub',
};

export default function ValisVenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#05070e] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden flex flex-col lg:flex-row">
      <style dangerouslySetInnerHTML={{ __html: `
        .space-star-bg {
          background-color: #05070e;
          background-image: 
            radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(217, 119, 6, 0.05) 0%, transparent 50%),
            radial-gradient(1px 1px at 20px 30px, #fbbf24 1px, transparent 0),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.7) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 90px 40px, #f59e0b 1px, transparent 0),
            radial-gradient(1px 1px at 160px 120px, rgba(255, 255, 255, 0.8) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 230px 190px, #fbbf24 1px, transparent 0),
            radial-gradient(1px 1px at 290px 80px, rgba(255, 255, 255, 0.6) 1px, transparent 0);
          background-size: 100% 100%, 100% 100%, 350px 350px, 350px 350px, 350px 350px, 350px 350px, 350px 350px, 350px 350px;
        }
      `}} />
      
      <div className="space-star-bg absolute inset-0 pointer-events-none -z-10" />

      <ValisVenSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10 min-h-screen">
        <ValisVenHeader />
        
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-8 relative">
          {children}
        </main>
        
        <footer className="w-full border-t border-amber-500/10 bg-slate-950/80 backdrop-blur-md py-4 px-6 mt-auto">
          <div className="w-full flex flex-col sm:flex-row items-center justify-center text-center gap-1 sm:gap-2">
            <p className="text-xs text-slate-400">
              <span className="text-amber-400/90 font-semibold">ValisVen</span> • Sistema Operativo de Ventas & Licencias | Seguridad: <span className="font-mono text-slate-300">AES-256</span> | Ecosistema Valis Hub © 2026
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
