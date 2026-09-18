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

/**
 * Consulta las tablas seleccionadas de Supabase en tiempo real para alimentar el contexto del LLM.
 */
async function fetchSupabaseLiveContext(selectedTables: string[] = []): Promise<string> {
  if (!selectedTables || selectedTables.length === 0) {
    return 'No hay tablas de Supabase seleccionadas para lectura.'
  }

  const supabase = await createClient()
  const sections: string[] = []

  // 1. Gastos Diarios
  if (selectedTables.includes('daily_expenses')) {
    const { data: expenses } = await supabase
      .from('daily_expenses')
      .select('description, amount, date, category')
      .order('date', { ascending: false })
      .limit(6)

    if (expenses && expenses.length > 0) {
      const list = expenses.map(e => `• ${e.description || 'Gasto'}: $${Number(e.amount || 0).toFixed(2)} (${e.date || 'Sin fecha'}${e.category ? `, ${e.category}` : ''})`).join('\n')
      sections.push(`[Gastos Recientes (daily_expenses)]:\n${list}`)
    }
  }

  // 2. Pagos Fijos
  if (selectedTables.includes('fixed_payments')) {
    const { data: payments } = await supabase
      .from('fixed_payments')
      .select('name, amount, due_date, is_paid')
      .limit(6)

    if (payments && payments.length > 0) {
      const list = payments.map(p => `• ${p.name || 'Pago'}: $${Number(p.amount || 0).toFixed(2)} (Vence: ${p.due_date || 'N/A'}${p.is_paid ? ', Pagado' : ', Pendiente'})`).join('\n')
      sections.push(`[Pagos Fijos (fixed_payments)]:\n${list}`)
    }
  }

  // 3. Ingresos
  if (selectedTables.includes('incomes')) {
    const { data: incomes } = await supabase
      .from('incomes')
      .select('source, amount, date')
      .order('date', { ascending: false })
      .limit(6)

    if (incomes && incomes.length > 0) {
      const list = incomes.map(i => `• ${i.source || 'Ingreso'}: $${Number(i.amount || 0).toFixed(2)} (${i.date || 'N/A'})`).join('\n')
      sections.push(`[Ingresos Recientes (incomes)]:\n${list}`)
    }
  }

  // 4. Clientes ValisVen
  if (selectedTables.includes('valisven_clientes')) {
    const { data: clients } = await supabase
      .from('valisven_clientes')
      .select('nombre_completo, empresa, telefono, estado')
      .limit(6)

    if (clients && clients.length > 0) {
      const list = clients.map(c => `• ${c.nombre_completo || 'Cliente'}${c.empresa ? ` (${c.empresa})` : ''} - Tel: ${c.telefono || 'N/A'} [Estado: ${c.estado || 'Activo'}]`).join('\n')
      sections.push(`[Clientes ValisVen (valisven_clientes)]:\n${list}`)
    }
  }

  // 5. Vehículos
  if (selectedTables.includes('vehicles')) {
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('brand, model, plate, year')
      .limit(5)

    if (vehicles && vehicles.length > 0) {
      const list = vehicles.map(v => `• ${v.brand || ''} ${v.model || ''} (${v.year || ''}) - Placa: ${v.plate || 'N/A'}`).join('\n')
      sections.push(`[Vehículos Registrados (vehicles)]:\n${list}`)
    }
  }

  // 6. Metas de Ahorro
  if (selectedTables.includes('savings_goals')) {
    const { data: goals } = await supabase
      .from('savings_goals')
      .select('name, target_amount, current_amount')
      .limit(5)

    if (goals && goals.length > 0) {
      const list = goals.map(g => `• ${g.name || 'Meta'}: Actual $${Number(g.current_amount || 0).toFixed(2)} de Meta $${Number(g.target_amount || 0).toFixed(2)}`).join('\n')
      sections.push(`[Metas de Ahorro (savings_goals)]:\n${list}`)
    }
  }

  if (sections.length === 0) {
    return 'Tablas conectadas pero sin registros recientes para mostrar.'
  }

  return sections.join('\n\n')
}

export async function testAgentInSandbox(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{ success: boolean; reply?: string; usedContext?: string; error?: string }> {
  try {
    const supabase = await createClient()
    
    // 1. Obtener configuración activa del agente
    const { data: agent } = await supabase
      .from('valischat_agent_config')
      .select('*')
      .eq('id', 'default_agent')
      .single()

    const systemPrompt = agent?.system_prompt || 'Eres el asistente oficial de ValisChat.'
    const modelProvider = agent?.model_provider || 'gemini'
    const modelName = agent?.model_name || (modelProvider === 'gemini' ? 'gemini-3.6-flash' : 'gpt-4o-mini')

    // 2. Obtener conectores para llaves y tablas seleccionadas
    const { data: connectors } = await supabase
      .from('valischat_connectors')
      .select('*')

    const supabaseConn = connectors?.find((c: any) => c.id === 'supabase')
    const selectedTables = supabaseConn?.config?.tables || [
      'daily_expenses', 
      'fixed_payments', 
      'incomes', 
      'valisven_clientes'
    ]

    // 3. Obtener contexto de Supabase real
    const liveDbContext = await fetchSupabaseLiveContext(selectedTables)

    const contextNote = `[Contexto de Supabase en vivo (Tablas: ${selectedTables.join(', ')}):\n${liveDbContext}\n\nNúmero WhatsApp oficial: +507 6234-6917 | Índice Vectorial Pinecone: ${agent?.pinecone_index || 'valis-docs-index'}]`

    // 4. Invocación de Google Gemini
    if (modelProvider === 'gemini') {
      const geminiConn = connectors?.find((c: any) => c.id === 'gemini')
      const geminiKey = geminiConn?.config?.api_key?.trim() || process.env.GEMINI_API_KEY
      
      if (!geminiKey) {
        return { 
          success: false, 
          error: 'No se encontró la clave de Gemini ni en .env.local (GEMINI_API_KEY) ni en la página de Conectores.' 
        }
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey.trim()}`
      
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
            parts: [{ text: `${systemPrompt}\n\nInstrucción adicional: Eres el agente oficial de ValisChat en WhatsApp. Puedes responder preguntas sobre los datos de la empresa o finanzas utilizando la información de la sección [Contexto de Supabase en vivo]. Sé cordial, conciso y directo.` }]
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
    } 
    
    // 5. Invocación de OpenAI
    else if (modelProvider === 'openai') {
      const openAiConn = connectors?.find((c: any) => c.id === 'openai')
      const apiKey = openAiConn?.config?.api_key?.trim() || process.env.OPENAI_API_KEY

      if (!apiKey) {
        return {
          success: false,
          error: 'No has configurado una API Key de OpenAI (agrega OPENAI_API_KEY a tu .env.local o ingrésala en Conectores).'
        }
      }

      const messages = [
        { role: 'system', content: `${systemPrompt}\n\n${contextNote}\n\nInstrucción adicional: Eres el agente oficial de ValisChat. Usa los datos del contexto de Supabase si el usuario pregunta por gastos, pagos, clientes o finanzas.` },
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
