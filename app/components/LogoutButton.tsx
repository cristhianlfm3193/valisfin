'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-sm transition group w-full"
    >
      <LogOut className="w-5 h-5 text-rose-500 group-hover:text-rose-600" />
      Cerrar Sesión
    </button>
  )
}

export function LogoutButtonMobile() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition shadow-sm"
      aria-label="Cerrar sesión"
    >
      <LogOut className="w-4 h-4" />
    </button>
  )
}
