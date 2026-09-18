import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConnectorsClient from './ConnectorsClient'

export const metadata = {
  title: 'Conectores | ValisChat IA',
  description: 'Conecta OpenAI, Gemini, Supabase y Pinecone a tu ecosistema de mensajería',
}

export default async function ConnectorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: connectors } = await supabase
    .from('valischat_connectors')
    .select('*')
    .order('id', { ascending: true })

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#090a0f] text-white">
      <ConnectorsClient initialConnectors={connectors || []} />
    </div>
  )
}
