import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getConnectors } from '@/app/actions/valischat_connectors'
import ConnectorsClient from './ConnectorsClient'

export const metadata = {
  title: 'Conectores | ValisChat IA',
  description: 'Conecta OpenAI, Gemini, Supabase, Google Calendar y Pinecone a tu ecosistema de mensajería',
}

export default async function ConnectorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { connectors, envStatus } = await getConnectors()

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#090a0f] text-white">
      <ConnectorsClient 
        initialConnectors={connectors || []} 
        envStatus={envStatus || {
          gemini: { hasKey: false, source: '' },
          openai: { hasKey: false, source: '' },
          pinecone: { hasKey: false, source: '' },
          google_calendar: { hasKey: false, source: '' },
          supabase: { hasKey: false, url: '' }
        }} 
      />
    </div>
  )
}
