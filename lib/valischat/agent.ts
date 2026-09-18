import { SupabaseClient, createClient } from '@supabase/supabase-js'
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
    let modelName = forcedModel || config.model_name || (provider === 'gemini' ? 'gemini-3.5-flash-lite' : 'gpt-4o-mini')

    // 2.1 Conectar cliente con acceso completo a ValisVen
    const dbClient = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!)
      : supabase

    // 2.2 Obtener catálogo en vivo desde valisven_licencias
    let catalogoContexto = ''
    try {
      const { data: licencias } = await dbClient
        .from('valisven_licencias')
        .select('tipo, producto, costo_venta')
        .order('tipo', { ascending: true })

      if (licencias && licencias.length > 0) {
        const porCategoria: Record<string, string[]> = {}
        for (const item of licencias) {
          const cat = item.tipo || 'Otras Licencias'
          if (!porCategoria[cat]) porCategoria[cat] = []
          const prodLower = item.producto.toLowerCase()
          const esAnual = prodLower.includes('año') || prodLower.includes('anual') || cat.includes('Office') || cat.includes('Seguridad') || cat.includes('Software')
          const modalidad = esAnual ? 'pago anual' : 'pago mensual'
          porCategoria[cat].push(`• ${item.producto}: $${Number(item.costo_venta).toFixed(2)} (${modalidad})`)
        }

        catalogoContexto = Object.entries(porCategoria)
          .map(([categoria, items]) => `[${categoria}]\n${items.join('\n')}`)
          .join('\n\n')
      }
    } catch (catErr) {
      console.warn('[ValisChat Agent] Error consultando catálogo ValisVen:', catErr)
    }

    if (!catalogoContexto) {
      catalogoContexto = `[Streaming]\n• Netflix: $5.00 (pago mensual)\n• Spotify: $3.00 (pago mensual)\n• Youtube Premium - 1 año: $65.00 (pago anual)\n\n[Office & Windows]\n• Microsoft 365 - Anual: $20.00 (pago anual)\n\n[Seguridad y Antivirus]\n• Antivirus McAfee: $20.00 (pago anual)\n\n[AI]\n• Gemini AI Pro: $4.00 (pago mensual)\n\n[Software]\n• OneDrive: $20.00 (pago anual)`
    }

    const systemPrompt = `${config.system_prompt || 'Eres ValisAI, asistente virtual de ValisVen encargada de la gestión de pedidos. Sé breve, amable y ve directo al grano.'}

============================================================
CATÁLOGO OFICIAL Y EN VIVO DE VALISVEN (Consultado desde la Base de Datos):
${catalogoContexto}
============================================================

Información de la conversación:
- Cliente: ${contactName}
- Teléfono/WhatsApp: ${phoneNumber || 'No proporcionado'}
- Nueva sesión iniciada (24h): ${memory.isNewSession ? 'Sí (la conversación previa expiró o es primer contacto)' : 'No (conversación activa)'}

INSTRUCCIONES CLAVE DE NEGOCIO PARA EL CUMPLIMIENTO DE REGLAS:
1. Saludo inicial: Si es el inicio de la conversación o un saludo, preséntate diciendo: "Hola, soy ValisAI, encargada de la gestión de tu pedido." y pregunta en qué puedes ayudarle.
2. Catálogo: Si te piden el catálogo o preguntan qué cuentas o licencias tienes disponibles, responde de inmediato con una lista de texto limpia y organizada agrupada por categorías usando ÚNICAMENTE los productos y precios del catálogo oficial de arriba.
3. Precios y detalles: Al dar detalles de un producto disponible, especifica claramente su costo exacto y si el pago es mensual o anual según lo indicado en el catálogo oficial de arriba:
   - Si el cliente pregunta por Office, Microsoft Office, o licencia de Office, el producto que tenemos en catálogo es "Microsoft 365 - Anual" con costo de $20.00 (pago anual). NUNCA menciones otros paquetes ni precios como $45.00.
   - Si preguntan por OneDrive, es $20.00 (pago anual).
   - Si preguntan por Netflix, es $5.00 (pago mensual).
   - Si preguntan por Spotify, es $3.00 (pago mensual).
   - Si preguntan por Youtube Premium, es Youtube Premium - 1 año a $65.00 (pago anual).
   - Si preguntan por Antivirus, es Antivirus McAfee a $20.00 (pago anual).
   - Si preguntan por Gemini AI, es Gemini AI Pro a $4.00 (pago mensual).
4. Cierre de servicio / Pedido:
   - Para iniciar la gestión de un pedido, pide únicamente Nombre y Correo.
   - Cuando el cliente proporcione su Nombre y Correo, DEBES ejecutar la herramienta 'tool_registrar_cliente_pedido_valisven' con esos datos para guardarlo en la base de clientes.
   - Explícale al usuario que sus datos se guardarán de forma segura en la base de clientes y que su pedido será gestionado en unos minutos.
5. No disponible: Si piden una licencia, producto o servicio de streaming que NO esté en la lista oficial anterior (por ejemplo Disney+, HBO Max, Canva, Paramount, etc.), responde EXACTAMENTE la siguiente frase literal:
"Verificaré esto; en unos minutos un asesor humano revisará el caso para buscarte una solución."

Herramientas disponibles:
- 'tool_consultar_catalogo_valisven': Para reconsultar o buscar productos en tiempo real en la base de datos de ValisVen.
- 'tool_registrar_cliente_pedido_valisven': Para guardar en la base de datos al cliente y su pedido cuando te proporcione su Nombre y Correo.
- 'tool_buscar_pdf_rag': Para dudas generales operativas del sistema Valis. NUNCA la uses para cotizar licencias ni precios de ValisVen.
- 'tool_agendar_calendar': Si el cliente solicita agendar una reunión o demostración.
- 'tool_enviar_email': Si se requiere enviar un correo formal al equipo de ventas.`

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
          signal: AbortSignal.timeout(28000)
        })
      }

      let res: Response | null = null
      try {
        res = await callGeminiApi(modelName, requestPayload)
        if (!res.ok) {
          const errTxt = await res.text()
          console.warn(`[ValisChat Agent] Error llamando a ${modelName} (${res.status}): ${errTxt}`)
        }
      } catch (fetchErr: any) {
        console.warn(`[ValisChat Agent] Excepción llamando a ${modelName}:`, fetchErr.message)
      }

      if (!res || !res.ok) {
        const fallbackModel = modelName === 'gemini-3.5-flash-lite' ? 'gemini-flash-latest' : 'gemini-3.5-flash-lite'
        console.warn(`[ValisChat Agent] Fallback en Gemini de ${modelName} a ${fallbackModel}`)
        modelName = fallbackModel
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

        // Ejecutar la herramienta en nuestro servidor con acceso a base de datos
        const toolResult = await executeTool(name, args, { chatId, phoneNumber, contactName, supabase: dbClient })
        toolExecutedInfo = { name, args, result: toolResult }

        // Turno de respuesta de la herramienta para que Gemini formule la respuesta en lenguaje natural
        const followUpContents = [
          ...contents,
          {
            role: 'model',
            parts: parts
          },
          {
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name,
                  response: toolResult,
                  ...(functionCallPart.functionCall.id ? { id: functionCallPart.functionCall.id } : {})
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
    // CEREBRO 2: OPENAI / CHATGPT / AIAPIFLOW (CODEX) con Function Calling
    // =========================================================================
    else if (provider === 'openai') {
      const openAiKey = (process.env.AIAPIFLOW_API_KEY || process.env.OPENAI_API_KEY)?.trim()
      if (!openAiKey) {
        throw new Error('Ni AIAPIFLOW_API_KEY ni OPENAI_API_KEY configuradas en las variables de entorno.')
      }

      const baseUrl = process.env.AIAPIFLOW_API_KEY
        ? 'https://aiapiflow.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions'

      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...memory.openAiHistory,
        { role: 'user', content: userMessage }
      ]

      const openAiTools = getOpenAIToolDeclarations()

      const callOpenAi = async (bodyPayload: any) => {
        return await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyPayload),
          signal: AbortSignal.timeout(28000)
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
        const toolResult = await executeTool(toolName, toolArgs, { chatId, phoneNumber, contactName, supabase: dbClient })
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
