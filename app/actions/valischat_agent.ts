'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AgentConfig = {
  id: string
  agent_name: string
  role_description: string
  system_prompt: string
  model_provider: string
  model_name: string
  temperature: number
  max_tokens: number
  selected_connectors: string[]
  pinecone_index: string
  mode: 'copilot' | 'autonomous'
  is_active: boolean
  updated_at: string
}

export async function getAgentConfig(): Promise<{ success: boolean; config?: AgentConfig; error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('valischat_agent_config')
      .select('*')
      .eq('id', 'default_agent')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching agent config:', error)
      return { success: false, error: error.message }
    }

    return { success: true, config: (data as AgentConfig) || null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateAgentConfig(
  configUpdates: Partial<AgentConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('valischat_agent_config')
      .upsert({
        id: 'default_agent',
        ...configUpdates,
        updated_at: new Date().toISOString()
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/agente')
    revalidatePath('/conectores')
    revalidatePath('/whatsapp')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function testAgentInSandbox(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{ success: boolean; reply?: string; usedContext?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Obtener configuración activa del agente
    const { data: agent } = await supabase
      .from('valischat_agent_config')
      .select('*')
      .eq('id', 'default_agent')
      .single()

    const systemPrompt = agent?.system_prompt || 'Eres el asistente oficial de ValisChat.'
    const modelProvider = agent?.model_provider || 'gemini'
    const modelName = agent?.model_name || 'gemini-2.0-flash'

    // Obtener conectores para llaves si es necesario
    const { data: connectors } = await supabase
      .from('valischat_connectors')
      .select('*')

    // Contexto relacional simulado de Supabase para enriquecer la respuesta
    const contextNote = `[Contexto activo de Supabase: Sistema ValisFin conectado | Número de WhatsApp oficial: +507 6234-6917 | Base Vectorial: ${agent?.pinecone_index || 'pinecone-general'}]`

    if (modelProvider === 'gemini') {
      const geminiKey = process.env.GEMINI_API_KEY
      if (!geminiKey) {
        return { 
          success: true, 
          reply: `(Simulación) [${agent?.agent_name || 'Agente'}]: He recibido tu mensaje "${userMessage}". Con Gemini configurado, responderé aplicando las siguientes reglas: ${systemPrompt.slice(0, 100)}...`,
          usedContext: contextNote
        }
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`
      
      const contents = [
        ...history.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        {
          role: 'user',
          parts: [{ text: `${contextNote}\n\nMensaje del cliente: ${userMessage}` }]
        }
      ]

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: `${systemPrompt}\n\nInstrucción adicional: Eres el agente oficial de ValisChat por WhatsApp. Sé conciso y cordial.` }]
          },
          generationConfig: {
            temperature: Number(agent?.temperature) || 0.7,
            maxOutputTokens: Number(agent?.max_tokens) || 800
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'Error invocando modelo Gemini.' }
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se obtuvo respuesta del modelo.'
      return { success: true, reply, usedContext: contextNote }
    } else if (modelProvider === 'openai') {
      const openAiConn = connectors?.find((c: any) => c.id === 'openai')
      const apiKey = openAiConn?.config?.api_key || process.env.OPENAI_API_KEY

      if (!apiKey) {
        return {
          success: false,
          error: 'No has configurado una API Key de OpenAI en la pestaña de Conectores.'
        }
      }

      const messages = [
        { role: 'system', content: `${systemPrompt}\n\n${contextNote}` },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
      ]

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature: Number(agent?.temperature) || 0.7,
          max_tokens: Number(agent?.max_tokens) || 800
        })
      })

      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'Error de API OpenAI.' }
      }

      const reply = data.choices?.[0]?.message?.content || 'Sin respuesta de OpenAI.'
      return { success: true, reply, usedContext: contextNote }
    }

    return {
      success: true,
      reply: `[${agent?.agent_name || 'Agente'}]: Mensaje procesado exitosamente.`,
      usedContext: contextNote
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al procesar el mensaje en el sandbox.' }
  }
}
