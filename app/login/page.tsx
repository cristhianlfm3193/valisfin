'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { getAppSettings } from '@/app/actions/admin'

export default function LoginPage() {
  const supabase = createClient()
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    getAppSettings('login_page').then(setSettings)
  }, [])

  const handleGoogleLogin = async () => {
    setToastMessage('Conectando con Google Authentication...')
    setShowToast(true)
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setToastMessage('Por favor ingresa correo y contraseña')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3500)
      return
    }
    
    setToastMessage(`Iniciando sesión como admin local...`)
    setShowToast(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setToastMessage('Credenciales incorrectas. Verifica tu acceso.')
      setTimeout(() => setShowToast(false), 3500)
    } else {
      // Record audit log for login
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('audit_logs').insert({
            table_name: 'auth',
            action: 'LOGIN',
            user_id: user.id
          })
        }
      } catch (e) {
        console.error('Failed to write login audit log', e)
      }
      
      setToastMessage(`Acceso concedido a ${email}`)
      window.location.href = '/' // Refresh and pass middleware
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 text-slate-800 login-bg relative">
      <main className="w-full max-w-5xl mx-auto z-10 relative">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_20px_45px_-15px_rgba(6,95,70,0.08),0_0_1px_1px_rgba(0,0,0,0.04)] border border-emerald-100/70 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Inspiration Section */}
          <section className="lg:col-span-5 relative flex flex-col justify-between overflow-hidden bg-emerald-900 min-h-[380px] sm:min-h-[440px] lg:min-h-full p-6 sm:p-8 text-white order-1 lg:order-1">
            <div className="absolute inset-0 z-0">
              <img alt="Nuestra bebé sonriendo con camiseta de Panamá" className="w-full h-full object-cover object-top filter brightness-[0.98] contrast-[1.03] scale-100 hover:scale-105 transition-transform duration-700 ease-out" src={settings?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuB58d3sZphwVWt6fY1zPpSOxEQ-bPt4YS2Dm1VY099OvbywhQIaI7Csiq1BenqPYc90MpRW5VmE_-xGkNe7UzuREoZ9E2yVMR0NAdaQ1S7cTNVbwWUXIIdqfsjGSKkNWaqW9gJoaSVtuBa0847SuZueapEkFp4dbqzafxYhhfTOvLofTPdeAqQcwpbMzM6dm2e-Luvjtet4aLuqSiFs37NtsGdiKhurGWRXJic0OJOcd5GRoU9ivTIxhCmpR5PxmXttSQ"}/>
              <div className="absolute inset-0 hero-photo-gradient pointer-events-none"></div>
            </div>
            
            <header className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold tracking-wide uppercase text-emerald-100">Portal Familiar Privado</span>
              </div>
              <span className="text-xs font-medium text-white/80 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                2025 • FC
              </span>
            </header>
            
            <article className="relative z-10 mt-auto pt-20">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md border border-emerald-300/30 text-emerald-100 text-xs font-semibold mb-3">
                <svg className="w-3.5 h-3.5 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
                <span>Por el futuro de nuestra bebé</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                {settings?.welcomeTitle || "Construyendo el patrimonio y bienestar de nuestra familia día a día."}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
                {settings?.welcomeSubtitle || "“Cada balboa cuidado es un paso firme y lleno de amor hacia su tranquilidad y mañana.”"}
              </p>
              
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-200/90">
                <span className="font-medium tracking-wide">Núcleo: Cristhian & Jennifer</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  Espacio blindado
                </span>
              </div>
            </article>
          </section>

          {/* Login Portal Section */}
          <section className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 order-2 lg:order-2 bg-white">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex justify-center w-full sm:w-auto sm:justify-start">
                  <img src="/logo.svg" alt="ValisFin Logo" className="h-16 sm:h-20 w-auto drop-shadow-sm" />
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Acceso 100% Protegido
                </div>
              </div>

              <div className="mt-6 mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Bienvenido a casa
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
                  Inicia sesión para ingresar al control conjunto de nuestro patrimonio.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Acceso de Padres</span>
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full min-h-[50px] py-3.5 px-4 rounded-2xl bg-white border border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 active:bg-slate-100 shadow-sm text-slate-700 font-semibold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                  </svg>
                  <span>Continuar con Google</span>
                </button>
              </div>

              <div className="relative my-5">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Alternativa</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <details className="group text-left">
                  <summary className="cursor-pointer list-none text-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors">
                    ¿Acceso de administrador local (emergencias)?
                  </summary>
                  <form onSubmit={handlePasswordLogin} className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="admin-email">Correo de administrador</label>
                      <input 
                        type="email" 
                        id="admin-email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full text-xs rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 py-2.5 px-3 border bg-white" 
                        placeholder="admin@valisfin.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="admin-password">Contraseña</label>
                      <input 
                        type="password" 
                        id="admin-password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full text-xs rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 py-2.5 px-3 border bg-white" 
                        placeholder="••••••••"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2.5 rounded-lg shrink-0 transition-colors mt-2"
                    >
                      Entrar como Admin
                    </button>
                  </form>
                </details>
              </div>
            </div>

            <footer className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"></path>
                </svg>
                <span>Acceso privado exclusivo para Cristhian y Jennifer</span>
              </div>
              <span className="text-[11px] text-slate-400">Panamá • Entorno Confidencial</span>
            </footer>
          </section>
        </div>

        {/* Toast */}
        <div className={`fixed bottom-5 right-5 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-medium flex items-center gap-3 z-50 transition-opacity ${showToast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></div>
          <span>{toastMessage}</span>
        </div>
      </main>
    </div>
  )
}
