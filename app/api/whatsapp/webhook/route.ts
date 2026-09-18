import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos el cliente de Supabase con Service Role para guardar mensajes desde el Webhook 
// ya que el Webhook no tiene una sesión de usuario de Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; // Debe ser el service_role key
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Verificación del Webhook por parte de Meta
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook de WhatsApp verificado exitosamente.");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
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
          if (change.value && change.value.messages && change.value.messages[0]) {
            const message = change.value.messages[0];
            const contact = change.value.contacts?.[0];
            
            // Datos básicos
            const phoneNumber = message.from; // Número del cliente
            const contactName = contact?.profile?.name || "Desconocido";
            const messageId = message.id;
            
            // Extraer texto
            let messageText = "";
            if (message.type === "text") {
              messageText = message.text.body;
            } else if (message.type === "image") {
              messageText = "📷 [Imagen]";
            } else if (message.type === "document") {
              messageText = "📄 [Documento]";
            } else if (message.type === "audio") {
              messageText = "🎵 [Nota de voz]";
            } else {
              messageText = `[Formato no soportado: ${message.type}]`;
            }

            console.log(`Mensaje recibido de ${contactName} (${phoneNumber}): ${messageText}`);

            // 1. Buscar el Chat
            let { data: chat, error: chatError } = await supabase
              .from('whatsapp_chats')
              .select('id, unread_count')
              .eq('phone_number', phoneNumber)
              .single();
            
            if (chatError && chatError.code !== 'PGRST116') {
              console.error("Error buscando chat:", chatError);
            }

            // 2. Si no existe, crearlo
            if (!chat) {
              const { data: newChat, error: insertChatError } = await supabase
                .from('whatsapp_chats')
                .insert({
                  phone_number: phoneNumber,
                  contact_name: contactName,
                  unread_count: 1
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
              // 3. Insertar el Mensaje
              // Verificamos primero si el mensaje ya existe (para evitar duplicados por reintentos del webhook)
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
