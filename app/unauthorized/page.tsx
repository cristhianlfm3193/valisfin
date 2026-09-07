'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-slate-800 bg-slate-50 relative">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-rose-100">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center shadow-inner border border-rose-100">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Acceso Denegado</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Esta cuenta de correo electrónico no está autorizada para ingresar al sistema de ValisFin. Este es un portal privado de uso exclusivo familiar.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/login"
            className="w-full flex items-center justify-center px-4 py-3 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            Volver a la pantalla de inicio
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-xs font-semibold text-slate-400">
        ValisFin • Acceso Restringido
      </div>
    </div>
  )
}
