import { createClient } from '@/lib/supabase/server'
import WhatsAppChatClient from './WhatsAppChatClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'ValisChat | WhatsApp Business',
}

export default async function WhatsAppPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Cargar lista de chats
  const { data: chats } = await supabase
    .from('whatsapp_chats')
    .select('*')
    .order('last_message_at', { ascending: false })

  // Cargar todos los mensajes de todos los chats para inicializar el estado
  // (En una app de producción muy grande, esto se cargaría perezosamente por chat)
  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="flex h-screen bg-[#090a0f] text-white overflow-hidden">
      <WhatsAppChatClient initialChats={chats || []} initialMessages={messages || []} />
    </div>
  )
}
