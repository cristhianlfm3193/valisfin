'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('audit_logs').insert({
          table_name: 'auth',
          action: 'LOGOUT',
          user_id: user.id
        })
      }
    } catch (e) {
      console.error(e)
    }
    
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      title="Cerrar Sesión"
      className={`flex items-center rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-sm transition-all group w-full ${
        isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
      }`}
    >
      <LogOut className="w-5 h-5 text-rose-500 group-hover:text-rose-600 shrink-0" />
      {!isCollapsed && <span className="truncate">Cerrar Sesión</span>}
    </button>
  )
}

export function LogoutButtonMobile() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('audit_logs').insert({
          table_name: 'auth',
          action: 'LOGOUT',
          user_id: user.id
        })
      }
    } catch (e) {
      console.error(e)
    }
    
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
