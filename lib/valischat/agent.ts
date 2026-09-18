import { SupabaseClient } from '@supabase/supabase-js'
import { getChatMemory } from './memory'
import { getGeminiToolDeclarations, getOpenAIToolDeclarations, executeTool } from './tools'
import { AgentConfig } from '@/lib/valischat'

export interface AgentRunResult {
  success: boolean
  reply: string
  toolExecuted?: {
    name: string
    args: any
    result: any
  }
  providerUsed: 'gemini' | 'openai'
  modelUsed: string
  latencyMs: number
  isNewSession: boolean
  error?: string
}

export interface RunAgentOptions {
  userMessage: string
  chatId: string
  phoneNumber?: string
  contactName?: string
  supabase: SupabaseClient
  forcedProvider?: 'gemini' | 'openai'
  forcedModel?: string
}

/**
 * Orquestador universal del Agente Inteligente de ValisChat.
 * Ejecuta Function Calling dinámico con Google Gemini o OpenAI / ChatGPT.
 */
export async function runValisChatAgent({
  userMessage,
  chatId,
  phoneNumber = '',
  contactName = 'Cliente',
  supabase,
  forcedProvider,
  forcedModel
}: RunAgentOptions): Promise<AgentRunResult> {
  const startTime = Date.now()

  try {
    // 1. Cargar Memoria de la Conversación (Regla 24h + Ventana Deslizante de 10 mensajes)
    const memory = await getChatMemory(chatId, supabase)

    // 2. Cargar Configuración del Agente desde Supabase
    const { data: configData } = await supabase
      .from('valischat_agent_config')
      .select('*')
      .eq('id', 'default_agent')
      .maybeSingle()

    const config: AgentConfig = configData || {
      id: 'default_agent',
      agent_name: 'ValisBot',
      role_description: 'Asistente de ventas y soporte',
      system_prompt: 'Eres el Asistente Inteligente de ValisChat. Tu misión es brindar asesoría comercial cordial, directa y resolver dudas sobre licencias y servicios de la empresa.',
      model_provider: 'gemini',
      model_name: 'gemini-2.5-flash',
      temperature: 0.7,
      max_tokens: 600,
      selected_connectors: ['supabase'],
      pinecone_index: '',
      mode: 'autonomous',
      is_active: true,
      updated_at: new Date().toISOString()
    }

    const provider = forcedProvider || (config.model_provider as 'gemini' | 'openai') || 'gemini'
    let modelName = forcedModel || config.model_name || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini')

    const systemPrompt = `${config.system_prompt || 'Eres el agente comercial y de atención al cliente de ValisChat.'}
Información de la conversación:
- Cliente: ${contactName}
- Teléfono/WhatsApp: ${phoneNumber || 'No proporcionado'}
- Nueva sesión iniciada (24h): ${memory.isNewSession ? 'Sí (la conversación previa expiró o es primer contacto)' : 'No (conversación activa)'}

Directrices de herramientas:
1. Si el cliente pregunta sobre precios de licencias, requisitos o cómo usar el sistema, usa 'tool_buscar_pdf_rag'.
2. Si el cliente solicita agendar una reunión, llamada o demo, usa 'tool_agendar_calendar'.
3. Si el cliente expresa clara intención de compra o pide que lo contacte un asesor para pagar, usa 'tool_enviar_email'.
Sé siempre conciso, profesional y cordial en tus respuestas finales de WhatsApp.`

    // =========================================================================
    // CEREBRO 1: GOOGLE GEMINI (Flash / Pro) con Function Calling
    // =========================================================================
    if (provider === 'gemini') {
      const geminiKey = process.env.GEMINI_API_KEY?.trim()
      if (!geminiKey) {
        throw new Error('GEMINI_API_KEY no encontrada en las variables de entorno.')
      }

      // Preparar historial de Gemini
      const contents: any[] = [
        ...memory.geminiHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ]

      const geminiTools = [{ functionDeclarations: getGeminiToolDeclarations() }]

      const requestPayload = {
        contents,
        tools: geminiTools,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: Number(config.temperature) || 0.7,
          maxOutputTokens: Number(config.max_tokens) || 600
        }
      }

      const callGeminiApi = async (targetModel: string, payload: any) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiKey}`
        return await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(14000)
        })
      }

      let res = await callGeminiApi(modelName, requestPayload).catch(() => null)
      if (!res || !res.ok) {
        // Fallback a modelo de alta disponibilidad si el principal satura
        console.warn(`[ValisChat Agent] Fallback en Gemini de ${modelName} a gemini-1.5-flash`)
        modelName = 'gemini-1.5-flash'
        res = await callGeminiApi(modelName, requestPayload).catch(() => null)
      }

      if (!res || !res.ok) {
        const errText = res ? await res.text() : 'Timeout'
        throw new Error(`Error en API de Google Gemini: ${errText}`)
      }

      const resData = await res.json()
      const firstCandidate = resData.candidates?.[0]
      const parts = firstCandidate?.content?.parts || []

      // Verificar si Gemini decidió invocar una herramienta (Function Calling)
      const functionCallPart = parts.find((p: any) => p.functionCall)

      let toolExecutedInfo: any = undefined
      let finalReply = ''

      if (functionCallPart && functionCallPart.functionCall) {
        const { name, args } = functionCallPart.functionCall
        console.log(`⚡ [Gemini Function Calling] El modelo decidió ejecutar: "${name}"`, args)

        // Ejecutar la herramienta en nuestro servidor
        const toolResult = await executeTool(name, args, { chatId, phoneNumber, contactName, supabase })
        toolExecutedInfo = { name, args, result: toolResult }

        // Turno de respuesta de la herramienta para que Gemini formule la respuesta en lenguaje natural
        const followUpContents = [
          ...contents,
          {
            role: 'model',
            parts: [functionCallPart]
          },
          {
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name,
                  response: toolResult
                }
              }
            ]
          }
        ]

        const followUpPayload = {
          ...requestPayload,
          contents: followUpContents
        }

        const secondTurnRes = await callGeminiApi(modelName, followUpPayload).catch(() => null)
        if (secondTurnRes && secondTurnRes.ok) {
          const secondTurnData = await secondTurnRes.json()
          finalReply = secondTurnData.candidates?.[0]?.content?.parts?.[0]?.text || ''
        } else {
          // Si el segundo turno falla, usamos el mensaje estructurado de la herramienta
          finalReply = toolResult.mensaje_para_cliente || toolResult.mensaje_sistema || JSON.stringify(toolResult)
        }
      } else {
        // Respuesta directa de texto sin herramientas
        finalReply = parts[0]?.text || 'No se recibió texto de respuesta.'
      }

      const latencyMs = Date.now() - startTime
      return {
        success: true,
        reply: finalReply,
        toolExecuted: toolExecutedInfo,
        providerUsed: 'gemini',
        modelUsed: modelName,
        latencyMs,
        isNewSession: memory.isNewSession
      }
    }

    // =========================================================================
    // CEREBRO 2: OPENAI / CHATGPT (GPT-4o / GPT-4o-mini) con Function Calling
    // =========================================================================
    else if (provider === 'openai') {
      const openAiKey = process.env.OPENAI_API_KEY?.trim()
      if (!openAiKey) {
        throw new Error('OPENAI_API_KEY no configurada en las variables de entorno.')
      }

      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...memory.openAiHistory,
        { role: 'user', content: userMessage }
      ]

      const openAiTools = getOpenAIToolDeclarations()

      const callOpenAi = async (bodyPayload: any) => {
        return await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyPayload),
          signal: AbortSignal.timeout(15000)
        })
      }

      const initialPayload = {
        model: modelName,
        messages,
        tools: openAiTools,
        tool_choice: 'auto',
        temperature: Number(config.temperature) || 0.7,
        max_tokens: Number(config.max_tokens) || 600
      }

      const res = await callOpenAi(initialPayload)
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Error en API de OpenAI: ${errText}`)
      }

      const data = await res.json()
      const message = data.choices?.[0]?.message
      let toolExecutedInfo: any = undefined
      let finalReply = ''

      if (message?.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0]
        const toolName = toolCall.function.name
        let toolArgs = {}
        try {
          toolArgs = JSON.parse(toolCall.function.arguments)
        } catch {
          toolArgs = {}
        }

        console.log(`⚡ [OpenAI Tool Calling] El modelo decidió ejecutar: "${toolName}"`, toolArgs)
        const toolResult = await executeTool(toolName, toolArgs, { chatId, phoneNumber, contactName, supabase })
        toolExecutedInfo = { name: toolName, args: toolArgs, result: toolResult }

        // Segundo turno con el resultado de la herramienta
        const followUpMessages = [
          ...messages,
          message,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult)
          }
        ]

        const secondRes = await callOpenAi({
          model: modelName,
          messages: followUpMessages,
          temperature: Number(config.temperature) || 0.7,
          max_tokens: Number(config.max_tokens) || 600
        })

        if (secondRes.ok) {
          const secondData = await secondRes.json()
          finalReply = secondData.choices?.[0]?.message?.content || ''
        } else {
          finalReply = toolResult.mensaje_para_cliente || toolResult.mensaje_sistema || JSON.stringify(toolResult)
        }
      } else {
        finalReply = message?.content || 'No se recibió respuesta de OpenAI.'
      }

      const latencyMs = Date.now() - startTime
      return {
        success: true,
        reply: finalReply,
        toolExecuted: toolExecutedInfo,
        providerUsed: 'openai',
        modelUsed: modelName,
        latencyMs,
        isNewSession: memory.isNewSession
      }
    }

    throw new Error(`Proveedor de IA desconocido: "${provider}"`)
  } catch (err: any) {
    console.error('[ValisChat Agent Error]:', err)
    return {
      success: false,
      reply: 'Disculpa, tuvimos un inconveniente momentáneo al procesar tu solicitud. Un asesor se comunicará contigo a la brevedad.',
      providerUsed: (forcedProvider || 'gemini') as any,
      modelUsed: forcedModel || 'unknown',
      latencyMs: Date.now() - startTime,
      isNewSession: false,
      error: err.message
    }
  }
}
