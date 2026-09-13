import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-[#121c27]/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-3 tracking-tight">Error de Autenticación</h1>
          
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            No se pudo completar el inicio de sesión. Esto suele ocurrir si el código de seguridad expiró, o si las URLs de redirección no coinciden.
          </p>

          <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-left mb-6">
            <h3 className="text-xs font-semibold text-gray-300 mb-2">💡 Tip para desarrollo:</h3>
            <p className="text-[11px] text-gray-400">
              Si estás probando desde <code className="text-teal-400 bg-teal-400/10 px-1 rounded">localhost</code> y te redirigió a Vercel, debes ir al panel de <strong>Supabase</strong> {'->'} Authentication {'->'} URL Configuration, y añadir <code className="text-pink-400 bg-pink-400/10 px-1 rounded">http://localhost:3000/**</code> a la lista de Redirect URLs permitidas.
            </p>
          </div>
          
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center gap-2 w-full bg-[#121c27]/10 hover:bg-[#121c27]/20 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all border border-white/10"
          >
            Volver a intentar
          </Link>
        </div>
      </div>
    </div>
  );
}
