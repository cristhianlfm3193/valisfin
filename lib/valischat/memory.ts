import { SupabaseClient } from '@supabase/supabase-js'

export interface RawChatMessage {
  id: string
  chat_id: string
  body: string
  direction: 'inbound' | 'outbound'
  created_at: string
}

export interface ChatMemoryResult {
  isNewSession: boolean
  lastMessageAt: string | null
  timeSinceLastMessageMs: number | null
  rawMessages: RawChatMessage[]
  geminiHistory: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>
  openAiHistory: Array<{ role: 'user' | 'assistant'; content: string }>
}

const INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000 // 24 Horas
const SLIDING_WINDOW_LIMIT = 10 // Máximo 10 mensajes recientes

/**
 * Consulta la memoria de la conversación en Supabase aplicando:
 * 1. Regla de Inactividad (24h): Si el último mensaje fue hace más de 24h,
 *    se ignora el historial y se inicia una sesión en blanco (history: []).
 * 2. Ventana Deslizante (Sliding Window): Si la sesión está activa (< 24h),
 *    extrae estrictamente solo los últimos 10 mensajes para contexto.
 */
export async function getChatMemory(
  chatId: string,
  supabase: SupabaseClient
): Promise<ChatMemoryResult> {
  try {
    // 1. Obtener el último mensaje registrado para evaluar inactividad
    const { data: latestMsg, error: latestError } = await supabase
      .from('whatsapp_messages')
      .select('created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestError) {
      console.error('[ValisChat Memory] Error consultando último mensaje:', latestError)
    }

    // Si no hay mensajes previos, es una sesión completamente nueva
    if (!latestMsg || !latestMsg.created_at) {
      return {
        isNewSession: true,
        lastMessageAt: null,
        timeSinceLastMessageMs: null,
        rawMessages: [],
        geminiHistory: [],
        openAiHistory: []
      }
    }

    const lastDate = new Date(latestMsg.created_at).getTime()
    const now = Date.now()
    const diffMs = now - lastDate

    // Regla de Inactividad (24 horas): ignorar historial si superó el límite
    if (diffMs > INACTIVITY_LIMIT_MS) {
      console.log(`[ValisChat Memory] Inactividad superada (${Math.round(diffMs / (1000 * 60 * 60))}h). Iniciando sesión en blanco.`);
      return {
        isNewSession: true,
        lastMessageAt: latestMsg.created_at,
        timeSinceLastMessageMs: diffMs,
        rawMessages: [],
        geminiHistory: [],
        openAiHistory: []
      }
    }

    // 2. Ventana Deslizante (Sliding Window): extraer los últimos 10 mensajes
    const { data: messages, error: msgsError } = await supabase
      .from('whatsapp_messages')
      .select('id, chat_id, body, direction, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(SLIDING_WINDOW_LIMIT)

    if (msgsError) {
      console.error('[ValisChat Memory] Error obteniendo ventana de mensajes:', msgsError)
      return {
        isNewSession: false,
        lastMessageAt: latestMsg.created_at,
        timeSinceLastMessageMs: diffMs,
        rawMessages: [],
        geminiHistory: [],
        openAiHistory: []
      }
    }

    // Invertir para que queden en orden cronológico (del más antiguo al más reciente)
    const chronological = (messages as RawChatMessage[] || []).reverse()

    // Formatear para Google Gemini (user / model)
    const geminiHistory = chronological.map(m => ({
      role: (m.direction === 'inbound' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: m.body }] as [{ text: string }]
    }))

    // Formatear para OpenAI / ChatGPT (user / assistant)
    const openAiHistory = chronological.map(m => ({
      role: (m.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.body
    }))

    return {
      isNewSession: false,
      lastMessageAt: latestMsg.created_at,
      timeSinceLastMessageMs: diffMs,
      rawMessages: chronological,
      geminiHistory,
      openAiHistory
    }
  } catch (err) {
    console.error('[ValisChat Memory] Error crítico en getChatMemory:', err)
    return {
      isNewSession: true,
      lastMessageAt: null,
      timeSinceLastMessageMs: null,
      rawMessages: [],
      geminiHistory: [],
      openAiHistory: []
    }
  }
}

/**
 * Guarda un mensaje entrante en la base de datos evitando duplicados de Meta.
 */
export async function saveInboundMessage(
  chatId: string,
  waMessageId: string,
  body: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; id?: string }> {
  try {
    const { data: existing } = await supabase
      .from('whatsapp_messages')
      .select('id')
      .eq('wa_message_id', waMessageId)
      .maybeSingle()

    if (existing) {
      return { success: true, id: existing.id }
    }

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        chat_id: chatId,
        wa_message_id: waMessageId,
        body,
        direction: 'inbound',
        status: 'received'
      })
      .select('id')
      .single()

    if (error) {
      console.error('[ValisChat Memory] Error insertando mensaje entrante:', error)
      return { success: false }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[ValisChat Memory] Error en saveInboundMessage:', err)
    return { success: false }
  }
}

/**
 * Guarda un mensaje saliente generado por el bot o agente en la base de datos.
 */
export async function saveOutboundMessage(
  chatId: string,
  body: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; id?: string }> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        chat_id: chatId,
        body,
        direction: 'outbound',
        status: 'sent'
      })
      .select('id')
      .single()

    if (error) {
      console.error('[ValisChat Memory] Error insertando mensaje saliente:', error)
      return { success: false }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[ValisChat Memory] Error en saveOutboundMessage:', err)
    return { success: false }
  }
}
