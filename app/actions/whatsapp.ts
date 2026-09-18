'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendWhatsAppMessage(chatId: string, messageText: string) {
  try {
    const supabase = await createClient()

    // 1. Obtener el número de teléfono del chat
    const { data: chat, error: chatError } = await supabase
      .from('whatsapp_chats')
      .select('phone_number')
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      return { success: false, error: 'Chat no encontrado.' }
    }

    const phoneNumber = chat.phone_number;
    
    // 2. Enviar el mensaje mediante la API de Meta
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      return { success: false, error: 'Credenciales de WhatsApp no configuradas en el servidor.' }
    }

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: messageText
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error enviando mensaje a Meta:", data);
      return { success: false, error: data?.error?.message || 'Error desconocido de Meta.' }
    }

    // 3. Guardar el mensaje saliente en nuestra base de datos local
    const metaMessageId = data.messages?.[0]?.id; // El ID que retorna Meta

    await supabase
      .from('whatsapp_messages')
      .insert({
        chat_id: chatId,
        wa_message_id: metaMessageId,
        body: messageText,
        direction: 'outbound',
        status: 'sent'
      })

    // Actualizar el last_message_at en el chat
    await supabase
      .from('whatsapp_chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId)

    revalidatePath('/whatsapp')
    
    return { success: true }
  } catch (error: any) {
    console.error("Error en sendWhatsAppMessage:", error);
    return { success: false, error: error.message || 'Error interno del servidor.' }
  }
}

export async function markChatAsRead(chatId: string) {
  try {
    const supabase = await createClient()
    await supabase
      .from('whatsapp_chats')
      .update({ unread_count: 0 })
      .eq('id', chatId)
      
    revalidatePath('/whatsapp')
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}
