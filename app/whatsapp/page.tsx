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

  // Cargar lista de chats, mensajes y configuración del agente en paralelo
  const [chatsRes, messagesRes, agentRes] = await Promise.all([
    supabase
      .from('whatsapp_chats')
      .select('*')
      .order('last_message_at', { ascending: false }),
    supabase
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: true }),
    supabase
      .from('valischat_agent_config')
      .select('is_active, mode')
      .eq('id', 'default_agent')
      .single()
  ])

  const initialGlobalBotActive = agentRes.data?.is_active ?? true
  const initialAgentMode = agentRes.data?.mode || 'autonomous'

  return (
    <div className="flex flex-1 h-[calc(100dvh-5rem)] lg:h-screen max-h-[100dvh] bg-[#090a0f] text-white overflow-hidden">
      <WhatsAppChatClient 
        initialChats={chatsRes.data || []} 
        initialMessages={messagesRes.data || []}
        initialGlobalBotActive={initialGlobalBotActive}
        initialAgentMode={initialAgentMode}
      />
    </div>
  )
}
