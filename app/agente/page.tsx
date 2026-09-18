import { Suspense } from 'react'
import { getAgentConfig } from '@/app/actions/valischat_agent'
import { getConnectors } from '@/app/actions/valischat_connectors'
import AgentStudioClient from './AgentStudioClient'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Estudio de Agente IA | ValisChat',
  description: 'Diseña, orquesta y configura el agente inteligente de ValisChat con flujos de contexto RAG y modelos LLM.'
}

export default async function AgentPage() {
  const [agentResult, connectorsResult] = await Promise.all([
    getAgentConfig(),
    getConnectors()
  ])

  const initialConfig = agentResult.config || {
    id: 'default_agent',
    agent_name: 'ValisBot',
    role_description: 'Asistente de atención y asesoría comercial para clientes en WhatsApp',
    system_prompt: `Eres el agente oficial de atención al cliente de ValisFin en WhatsApp. 
Tu objetivo es responder con amabilidad, precisión y rapidez en español latinoamericano.
Si el usuario consulta sobre servicios o pagos, guíalo con claridad y ofrece asistencia personalizada.`,
    model_provider: 'gemini',
    model_name: 'gemini-2.0-flash',
    temperature: 0.7,
    max_tokens: 800,
    selected_connectors: ['whatsapp', 'gemini', 'supabase', 'pinecone'],
    pinecone_index: 'valis-docs-index',
    mode: 'copilot',
    is_active: true,
    updated_at: new Date().toISOString()
  }

  const connectors = connectorsResult.connectors || []

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-emerald-400">
            <Loader2 className="w-10 h-10 animate-spin" />
            <span className="text-sm font-medium tracking-wide">Cargando Estudio de Agente...</span>
          </div>
        </div>
      }
    >
      <AgentStudioClient initialConfig={initialConfig} connectors={connectors} />
    </Suspense>
  )
}
