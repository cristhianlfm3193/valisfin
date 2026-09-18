'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { AgentConfig } from '@/lib/valischat'
import { sendWhatsAppMessage } from '@/app/actions/whatsapp'

export type { AgentConfig }

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
 * Consulta las tablas seleccionadas de Supabase en paralelo ultra-rápido con Promise.all
 */
async function fetchSupabaseLiveContext(selectedTables: string[] = [], customClient?: any): Promise<string> {
  if (!selectedTables || selectedTables.length === 0) {
    return 'No hay tablas de Supabase seleccionadas para lectura.'
  }

  const supabase = customClient || await createClient()
  const promises: Promise<string | null>[] = []

  // 1. Gastos Diarios
  if (selectedTables.includes('daily_expenses')) {
    promises.push((async () => {
      try {
        const { data } = await supabase
          .from('daily_expenses')
          .select('description, amount, date, category')
          .order('date', { ascending: false })
          .limit(5)
        if (!data || data.length === 0) return null
        const list = data.map((e: any) => `• ${e.description || 'Gasto'}: $${Number(e.amount || 0).toFixed(2)} (${e.date || 'Sin fecha'}${e.category ? `, ${e.category}` : ''})`).join('\n')
        return `[Gastos Recientes (daily_expenses)]:\n${list}`
      } catch {
        return null
      }
    })())
  }

  // 2. Pagos Fijos
  if (selectedTables.includes('fixed_payments')) {
    promises.push((async () => {
      try {
        const { data } = await supabase
          .from('fixed_payments')
          .select('name, amount, due_date, is_paid')
          .limit(5)
        if (!data || data.length === 0) return null
        const list = data.map((p: any) => `• ${p.name || 'Pago'}: $${Number(p.amount || 0).toFixed(2)} (Vence: ${p.due_date || 'N/A'}${p.is_paid ? ', Pagado' : ', Pendiente'})`).join('\n')
        return `[Pagos Fijos (fixed_payments)]:\n${list}`
      } catch {
        return null
      }
    })())
  }

  // 3. Ingresos
  if (selectedTables.includes('incomes')) {
    promises.push((async () => {
      try {
        const { data } = await supabase
          .from('incomes')
          .select('source, amount, date')
          .order('date', { ascending: false })
          .limit(5)
        if (!data || data.length === 0) return null
        const list = data.map((i: any) => `• ${i.source || 'Ingreso'}: $${Number(i.amount || 0).toFixed(2)} (${i.date || 'N/A'})`).join('\n')
        return `[Ingresos Recientes (incomes)]:\n${list}`
      } catch {
        return null
      }
    })())
  }

  // 4. Clientes ValisVen
  if (selectedTables.includes('valisven_clientes')) {
    promises.push((async () => {
      try {
        const { data } = await supabase
          .from('valisven_clientes')
          .select('nombre_completo, empresa, telefono, estado')
          .limit(5)
        if (!data || data.length === 0) return null
        const list = data.map((c: any) => `• ${c.nombre_completo || 'Cliente'}${c.empresa ? ` (${c.empresa})` : ''} - Tel: ${c.telefono || 'N/A'} [Estado: ${c.estado || 'Activo'}]`).join('\n')
        return `[Clientes ValisVen (valisven_clientes)]:\n${list}`
      } catch {
        return null
      }
    })())
  }

  // 5. Vehículos
  if (selectedTables.includes('vehicles')) {
    promises.push((async () => {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select('brand, model, plate, year')
          .limit(5)
        if (!data || data.length === 0) return null
        const list = data.map((v: any) => `• ${v.brand || ''} ${v.model || ''} (${v.year || ''}) - Placa: ${v.plate || 'N/A'}`).join('\n')
        return `[Vehículos Registrados (vehicles)]:\n${list}`
      } catch {
        return null
      }
    })())
  }

  // 6. Metas de Ahorro
  if (selectedTables.includes('savings_goals')) {
    promises.push((async () => {
      try {
        const { data } = await supabase
          .from('savings_goals')
          .select('name, target_amount, current_amount')
          .limit(5)
        if (!data || data.length === 0) return null
        const list = data.map((g: any) => `• ${g.name || 'Meta'}: Actual $${Number(g.current_amount || 0).toFixed(2)} de Meta $${Number(g.target_amount || 0).toFixed(2)}`).join('\n')
        return `[Metas de Ahorro (savings_goals)]:\n${list}`
      } catch {
        return null
      }
    })())
  }

  const results = await Promise.all(promises)
  const activeSections = results.filter((s): s is string => typeof s === 'string')

  if (activeSections.length === 0) {
    return 'Tablas conectadas pero sin registros recientes para mostrar.'
  }

  return activeSections.join('\n\n')
}

export async function testAgentInSandbox(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  customClient?: any
): Promise<{ success: boolean; reply?: string; usedContext?: string; latencyMs?: number; error?: string }> {
  const startTime = Date.now()
  try {
    const supabase = customClient || await createClient()
    
    // 1. Obtener configuración activa del agente y conectores en paralelo
    const [agentRes, connectorsRes] = await Promise.all([
      supabase.from('valischat_agent_config').select('*').eq('id', 'default_agent').single(),
      supabase.from('valischat_connectors').select('*')
    ])

    const agent = agentRes.data
    const connectors = connectorsRes.data

    const systemPrompt = agent?.system_prompt || 'Eres el asistente oficial de ValisChat.'
    const modelProvider = agent?.model_provider || 'gemini'
    
    // Por defecto usar gemini-3.5-flash-lite que responde en ~700ms
    let modelName = agent?.model_name || (modelProvider === 'gemini' ? 'gemini-3.5-flash-lite' : 'gpt-4o-mini')
    if (modelName === 'gemini-3.6-flash') {
      // Si estaba en gemini-3.6-flash (que tiene cola de razonamiento de 60s), preferir 3.5-flash-lite
      modelName = 'gemini-3.5-flash-lite'
    }

    const supabaseConn = connectors?.find((c: any) => c.id === 'supabase')
    const selectedTables = supabaseConn?.config?.tables || [
      'daily_expenses', 
      'fixed_payments', 
      'incomes', 
      'valisven_clientes'
    ]

    // 2. Obtener contexto de Supabase real en paralelo ultra-rápido
    const liveDbContext = await fetchSupabaseLiveContext(selectedTables, supabase)

    const contextNote = `[Contexto de Supabase en vivo (Tablas: ${selectedTables.join(', ')}):\n${liveDbContext}\n\nNúmero WhatsApp oficial: +507 6234-6917 | Índice Vectorial Pinecone: ${agent?.pinecone_index || 'valis-docs-index'}]`

    // 3. Invocación de Google Gemini con Timeout de 10 segundos
    if (modelProvider === 'gemini') {
      const geminiConn = connectors?.find((c: any) => c.id === 'gemini')
      const geminiKey = geminiConn?.config?.api_key?.trim() || process.env.GEMINI_API_KEY
      
      if (!geminiKey) {
        return { 
          success: false, 
          error: 'No se encontró la clave de Gemini en .env.local (GEMINI_API_KEY).' 
        }
      }

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

      const requestBody = {
        contents,
        systemInstruction: {
          parts: [{ text: `${systemPrompt}\n\nInstrucción adicional: Eres el agente oficial de ValisChat en WhatsApp. Puedes responder preguntas sobre los datos de la empresa o finanzas utilizando la información de la sección [Contexto de Supabase en vivo]. Sé cordial, conciso y directo.` }]
        },
        generationConfig: {
          temperature: Number(agent?.temperature) || 0.7,
          maxOutputTokens: Number(agent?.max_tokens) || 600
        }
      }

      // Función con intento principal y fallback ultra rápido si la API de Google satura
      const callGemini = async (targetModel: string) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiKey.trim()}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(12000) // 12s timeout max
        })
        return res
      }

      let res = await callGemini(modelName).catch(() => null)
      
      // Si el modelo falló por alta demanda o timeout, intentar de inmediato con gemini-3.5-flash-lite
      if (!res || !res.ok) {
        if (modelName !== 'gemini-3.5-flash-lite') {
          res = await callGemini('gemini-3.5-flash-lite').catch(() => null)
        }
      }

      if (!res) {
        return { 
          success: false, 
          error: 'Tiempo de espera agotado con la API de Google Gemini. Por favor intenta de nuevo.' 
        }
      }

      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'Error invocando modelo Gemini.' }
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se obtuvo respuesta del modelo.'
      const latencyMs = Date.now() - startTime
      return { success: true, reply, usedContext: contextNote, latencyMs }
    } 
    
    // 4. Invocación de OpenAI
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
          max_tokens: Number(agent?.max_tokens) || 600
        }),
        signal: AbortSignal.timeout(12000)
      })

      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error?.message || 'Error de API OpenAI.' }
      }

      const reply = data.choices?.[0]?.message?.content || 'Sin respuesta de OpenAI.'
      const latencyMs = Date.now() - startTime
      return { success: true, reply, usedContext: contextNote, latencyMs }
    }

    const latencyMs = Date.now() - startTime
    return {
      success: true,
      reply: `[${agent?.agent_name || 'Agente'}]: Mensaje procesado exitosamente.`,
      usedContext: contextNote,
      latencyMs
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al procesar el mensaje en el sandbox.' }
  }
}

/**
 * Genera una sugerencia de respuesta inteligente para un chat específico de WhatsApp,
 * analizando el historial reciente y aplicando el contexto de negocio.
 */
export async function generateAgentReplyForChat(
  chatId: string,
  customClient?: any
): Promise<{ success: boolean; reply?: string; latencyMs?: number; error?: string }> {
  try {
    const supabase = customClient || await createClient()

    // Obtener los últimos mensajes de este chat
    const { data: recentMsgs, error } = await supabase
      .from('whatsapp_messages')
      .select('direction, body, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(10)

    if (error) {
      return { success: false, error: 'Error al consultar mensajes del chat.' }
    }

    // Buscar el último mensaje del cliente
    const lastCustomerMsg = recentMsgs && recentMsgs.length > 0
      ? [...recentMsgs].reverse().find(m => m.direction === 'inbound')
      : null

    // Si no hay mensajes entrantes del cliente, generar saludo inicial cordial
    const promptText = lastCustomerMsg
      ? lastCustomerMsg.body
      : 'Inicia la conversación saludando amablemente al cliente y ofreciendo asistencia con sus consultas o servicios de la empresa.'

    // Historial para contexto
    const history = (recentMsgs || [])
      .filter((m: any) => !lastCustomerMsg || m.body !== lastCustomerMsg.body)
      .map((m: any) => ({
        role: (m.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.body
      }))

    return await testAgentInSandbox(promptText, history, supabase)
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al generar sugerencia de IA.' }
  }
}

/**
 * Genera la respuesta inteligente del agente y la envía de inmediato a WhatsApp
 */
export async function triggerAgentReplyAndSend(
  chatId: string,
  customClient?: any
): Promise<{ success: boolean; reply?: string; latencyMs?: number; error?: string }> {
  try {
    const res = await generateAgentReplyForChat(chatId, customClient)
    if (!res.success || !res.reply) {
      return { success: false, error: res.error || 'No se pudo generar la respuesta del agente IA.' }
    }

    const sendRes = await sendWhatsAppMessage(chatId, res.reply, customClient)
    if (!sendRes.success) {
      return { success: false, error: sendRes.error || 'No se pudo enviar el mensaje a WhatsApp.' }
    }

    return { success: true, reply: res.reply, latencyMs: res.latencyMs }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al ejecutar respuesta del agente.' }
  }
}

/**
 * Cambia el modo de operación del agente (autonomous vs copilot)
 */
export async function toggleAgentMode(
  mode: 'autonomous' | 'copilot'
): Promise<{ success: boolean; mode?: 'autonomous' | 'copilot'; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('valischat_agent_config')
      .update({ mode, updated_at: new Date().toISOString() })
      .eq('id', 'default_agent')

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/whatsapp')
    revalidatePath('/agente')
    return { success: true, mode }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
