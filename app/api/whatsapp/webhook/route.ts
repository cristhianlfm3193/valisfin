import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateAgentReplyForChat } from '@/app/actions/valischat_agent';
import { sendWhatsAppMessage } from '@/app/actions/whatsapp';

// Usamos el cliente de Supabase con Service Role para guardar mensajes desde el Webhook 
// ya que el Webhook no tiene una sesión de usuario de Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Verificación del Webhook por parte de Meta
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const envToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim().replace(/['"]/g, '');

  const isTokenValid =
    (token && token.trim() === 'valishub_seguro_2026') ||
    (envToken && token && token.trim() === envToken);

  if (mode === "subscribe" && isTokenValid) {
    console.log("Webhook de WhatsApp verificado exitosamente.");
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  console.warn("Verificación de webhook fallida. Token recibido:", token, "Esperado:", envToken || 'valishub_seguro_2026');
  return new NextResponse(`Forbidden: invalid token`, { status: 403 });
}

// POST: Recepción de mensajes de WhatsApp
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🔔 [WhatsApp Webhook POST recibido]:", JSON.stringify(body, null, 2));

    // Verificamos si es un evento válido de WhatsApp
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;

          // 1. Procesar mensajes entrantes del cliente
          if (value.messages && Array.isArray(value.messages)) {
            for (const message of value.messages) {
              const contact = value.contacts?.find((c: any) => c.wa_id === message.from) || value.contacts?.[0];
              
              // Datos básicos
              const phoneNumber = message.from; // Número del cliente
              const contactName = contact?.profile?.name || "Desconocido";
              const messageId = message.id;
              
              // Extraer texto o tipo de contenido
              let messageText = "";
              if (message.type === "text") {
                messageText = message.text?.body || "";
              } else if (message.type === "image") {
                messageText = message.image?.caption ? `📷 ${message.image.caption}` : "📷 [Imagen]";
              } else if (message.type === "document") {
                messageText = message.document?.filename ? `📄 ${message.document.filename}` : "📄 [Documento]";
              } else if (message.type === "audio") {
                messageText = "🎵 [Nota de voz]";
              } else if (message.type === "location") {
                messageText = `📍 [Ubicación]`;
              } else {
                messageText = `[Formato: ${message.type}]`;
              }

              console.log(`Mensaje recibido de ${contactName} (${phoneNumber}): ${messageText}`);

              // 1.1 Buscar el Chat
              let { data: chat, error: chatError } = await supabase
                .from('whatsapp_chats')
                .select('id, unread_count')
                .eq('phone_number', phoneNumber)
                .single();
              
              if (chatError && chatError.code !== 'PGRST116') {
                console.error("Error buscando chat:", chatError);
              }

              // 1.2 Si no existe el chat, crearlo
              if (!chat) {
                const { data: newChat, error: insertChatError } = await supabase
                  .from('whatsapp_chats')
                  .insert({
                    phone_number: phoneNumber,
                    contact_name: contactName,
                    unread_count: 1,
                    last_message_at: new Date().toISOString()
                  })
                  .select('id, unread_count')
                  .single();
                
                if (insertChatError) {
                  console.error("Error creando chat:", insertChatError);
                }
                chat = newChat;
              } else {
                // Actualizar el chat existente
                await supabase
                  .from('whatsapp_chats')
                  .update({
                    contact_name: contactName,
                    last_message_at: new Date().toISOString(),
                    unread_count: (chat.unread_count || 0) + 1
                  })
                  .eq('id', chat.id);
              }

              if (chat) {
                // 1.3 Insertar el Mensaje (evitando duplicados por reintentos de Meta)
                const { data: existingMessage } = await supabase
                  .from('whatsapp_messages')
                  .select('id')
                  .eq('wa_message_id', messageId)
                  .single();

                if (!existingMessage) {
                  const { error: insertMsgError } = await supabase
                    .from('whatsapp_messages')
                    .insert({
                      chat_id: chat.id,
                      wa_message_id: messageId,
                      body: messageText,
                      direction: 'inbound',
                      status: 'received'
                    });
                    
                  if (insertMsgError) {
                    console.error("Error insertando mensaje:", insertMsgError);
                  }

                  // 1.4 Auto-respuesta del Agente si el bot está activo en este chat y en modo autónomo
                  try {
                    const [agentRes, chatRes] = await Promise.all([
                      supabase.from('valischat_agent_config').select('*').eq('id', 'default_agent').single(),
                      supabase.from('whatsapp_chats').select('is_bot_active').eq('id', chat.id).single()
                    ]);

                    const agentConfig = agentRes.data;
                    const chatData = chatRes.data;
                    const isGlobalActive = agentConfig?.is_active ?? true;
                    const isChatBotActive = chatData?.is_bot_active ?? true;

                    // Si el bot está activo globalmente y en esta conversación (no pausado) y en modo autónomo
                    if (isGlobalActive && isChatBotActive && agentConfig?.mode === 'autonomous') {
                      console.log(`🤖 [Bot Autónomo Activo] Generando respuesta contextual con IA para ${phoneNumber}...`);
                      const aiRes = await generateAgentReplyForChat(chat.id, supabase);
                      
                      if (aiRes.success && aiRes.reply) {
                        const sendRes = await sendWhatsAppMessage(chat.id, aiRes.reply, supabase);
                        if (sendRes.success) {
                          console.log(`🤖 [Bot Autónomo] Respuesta enviada con éxito a ${phoneNumber} (${aiRes.latencyMs || 0}ms)`);
                        } else {
                          console.error("Error al enviar respuesta por Meta WhatsApp API:", sendRes.error);
                        }
                      } else {
                        console.warn("No se pudo generar respuesta del agente:", aiRes.error);
                      }
                    } else {
                      console.log(`⏸️ [Bot no activo para este chat] isGlobalActive: ${isGlobalActive}, isChatBotActive: ${isChatBotActive}, mode: ${agentConfig?.mode}`);
                    }
                  } catch (autoErr) {
                    console.error("Error en auto-respuesta autónoma del agente:", autoErr);
                  }
                }
              }
            }
          }

          // 2. Procesar actualizaciones de estado de mensajes salientes (sent -> delivered -> read)
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const statusObj of value.statuses) {
              const { id: waMessageId, status } = statusObj;
              if (waMessageId && status) {
                await supabase
                  .from('whatsapp_messages')
                  .update({ status })
                  .eq('wa_message_id', waMessageId);
              }
            }
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    }

    return new NextResponse("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error procesando el webhook de WhatsApp:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
