import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runValisChatAgent } from '@/lib/valischat/agent'
import { saveInboundMessage, saveOutboundMessage } from '@/lib/valischat/memory'
import { sendWhatsAppMessage } from '@/app/actions/whatsapp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * GET /api/whatsapp: Verificación del Webhook por Meta
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const envToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim().replace(/['"]/g, '')
  const isValid =
    (token && token.trim() === 'valishub_seguro_2026') ||
    (envToken && token && token.trim() === envToken)

  if (mode === 'subscribe' && isValid) {
    console.log('✅ [ValisChat Webhook /api/whatsapp] Verificado exitosamente.')
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  return new NextResponse('Forbidden: invalid token', { status: 403 })
}

/**
 * POST /api/whatsapp: Recepción de mensajes, memoria 24h/10ms y agente con Function Calling
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value
          if (!value || !value.messages || !Array.isArray(value.messages)) continue

          for (const message of value.messages) {
            const contact = value.contacts?.find((c: any) => c.wa_id === message.from) || value.contacts?.[0]
            const phoneNumber = message.from
            const contactName = contact?.profile?.name || 'Cliente'
            const messageId = message.id

            // Extraer el texto del mensaje
            let userText = ''
            if (message.type === 'text') {
              userText = message.text?.body || ''
            } else if (message.type === 'image') {
              userText = message.image?.caption || '📷 [Imagen]'
            } else if (message.type === 'document') {
              userText = message.document?.filename || '📄 [Documento]'
            } else {
              userText = `[${message.type}]`
            }

            console.log(`📩 [ValisChat Webhook] Mensaje recibido de ${contactName} (${phoneNumber}): "${userText}"`)

            // 1. Obtener o crear el chat en Supabase
            let { data: chat } = await supabase
              .from('whatsapp_chats')
              .select('id, unread_count, is_bot_active')
              .eq('phone_number', phoneNumber)
              .maybeSingle()

            if (!chat) {
              const { data: newChat } = await supabase
                .from('whatsapp_chats')
                .insert({
                  phone_number: phoneNumber,
                  contact_name: contactName,
                  unread_count: 1,
                  last_message_at: new Date().toISOString()
                })
                .select('id, unread_count, is_bot_active')
                .single()
              chat = newChat
            } else {
              await supabase
                .from('whatsapp_chats')
                .update({
                  contact_name: contactName,
                  last_message_at: new Date().toISOString(),
                  unread_count: (chat.unread_count || 0) + 1
                })
                .eq('id', chat.id)
            }

            if (!chat) continue

            // 2. Guardar mensaje entrante evitando duplicados
            await saveInboundMessage(chat.id, messageId, userText, supabase)

            // 3. Consultar configuración de agente
            const { data: agentConfig } = await supabase
              .from('valischat_agent_config')
              .select('*')
              .eq('id', 'default_agent')
              .maybeSingle()

            const isGlobalActive = agentConfig?.is_active ?? true
            const isChatBotActive = chat.is_bot_active ?? true

            // Si el bot está activo en modo autónomo, ejecutar el agente
            if (isGlobalActive && isChatBotActive && agentConfig?.mode === 'autonomous') {
              console.log(`🤖 [ValisChat Webhook] Ejecutando Agente IA (${agentConfig?.model_provider || 'gemini'})...`)

              // 4. Ejecutar agente con memoria (24h inactividad + 10 msgs ventana) y Function Calling
              const agentResult = await runValisChatAgent({
                userMessage: userText,
                chatId: chat.id,
                phoneNumber,
                contactName,
                supabase
              })

              if (agentResult.success && agentResult.reply) {
                // 5. Enviar respuesta oficial a la API de WhatsApp
                const sendRes = await sendWhatsAppMessage(chat.id, agentResult.reply, supabase)
                if (sendRes.success) {
                  console.log(`✅ [ValisChat Webhook] Respuesta enviada con éxito (${agentResult.latencyMs}ms)${agentResult.toolExecuted ? ` [Tool: ${agentResult.toolExecuted.name}]` : ''}`)
                } else {
                  console.error('❌ [ValisChat Webhook] Error al enviar WhatsApp:', sendRes.error)
                }
              }
            }
          }
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 })
    }

    return new NextResponse('Not Found', { status: 404 })
  } catch (error: any) {
    console.error('❌ [ValisChat Webhook Error]:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
