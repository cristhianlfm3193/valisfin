/**
 * Cliente de la API de Telegram Bot para ValisHub
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface InlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineButton[][];
}

export interface KeyboardButton {
  text: string;
}

export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  is_persistent?: boolean;
}

export type TelegramReplyMarkup = InlineKeyboardMarkup | ReplyKeyboardMarkup;

/**
 * Valida si un Chat ID está autorizado para usar el bot.
 * Si TELEGRAM_ALLOWED_CHAT_IDS no está definido, se permite para que el dueño
 * pueda obtener su Chat ID en su primer /start.
 */
export function isChatAuthorized(chatId: number | string): boolean {
  const allowed = process.env.TELEGRAM_ALLOWED_CHAT_IDS?.trim();
  if (!allowed) {
    return true; // Modo inicial/abierto hasta configurar el ID
  }
  const idList = allowed.split(',').map(id => id.trim());
  return idList.includes(String(chatId));
}

/**
 * Envía un mensaje con formato HTML y teclado opcional (Inline o Reply)
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: TelegramReplyMarkup
) {
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN no configurado');
    return null;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error enviando mensaje a Telegram:', err);
    return null;
  }
}

/**
 * Edita un mensaje existente (ideal para navegación fluida de menús con botones)
 */
export async function editTelegramMessage(
  chatId: number | string,
  messageId: number,
  text: string,
  replyMarkup?: InlineKeyboardMarkup
) {
  if (!BOT_TOKEN) return null;

  try {
    const res = await fetch(`${TELEGRAM_API}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error editando mensaje de Telegram:', err);
    return null;
  }
}

/**
 * Responde a un callback query para quitar el spinner del botón
 */
export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  if (!BOT_TOKEN) return null;

  try {
    const res = await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error respondiendo callback query:', err);
    return null;
  }
}

/**
 * Envía el indicador visual "escribiendo..." en el chat
 */
export async function sendChatAction(chatId: number | string, action: 'typing' = 'typing') {
  if (!BOT_TOKEN) return null;

  try {
    await fetch(`${TELEGRAM_API}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action,
      }),
    });
  } catch (err) {
    // Silencioso
  }
}

/**
 * Descarga una foto enviada por Telegram y la convierte a Base64
 */
export async function downloadTelegramImageAsBase64(fileId: string): Promise<{ base64: string; mimeType: string } | null> {
  if (!BOT_TOKEN) return null;

  try {
    // 1. Obtener file_path
    const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const fileData = await fileRes.json();
    if (!fileData.ok || !fileData.result?.file_path) {
      console.error('Error obteniendo file_path de Telegram:', fileData);
      return null;
    }

    const filePath = fileData.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // 2. Descargar el archivo binario
    const imageRes = await fetch(downloadUrl);
    if (!imageRes.ok) {
      console.error('Error descargando imagen de Telegram:', imageRes.statusText);
      return null;
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    let mimeType = 'image/jpeg';
    if (filePath.endsWith('.png')) mimeType = 'image/png';
    else if (filePath.endsWith('.webp')) mimeType = 'image/webp';
    else if (filePath.endsWith('.pdf')) mimeType = 'application/pdf';

    return { base64, mimeType };
  } catch (err) {
    console.error('Error descargando foto de Telegram:', err);
    return null;
  }
}

/**
 * Configura la lista de comandos sugeridos en el menú nativo del bot en Telegram
 */
export async function setTelegramBotCommands() {
  if (!BOT_TOKEN) return null;
  const commands = [
    { command: 'menu', description: '📊 Menú interactivo principal' },
    { command: 'pagos', description: '💳 Ver y pagar compromisos pendientes' },
    { command: 'gastos', description: '💸 Resumen de gastos del mes' },
    { command: 'keiko', description: '📈 Reporte de ventas de vendedores' },
    { command: 'cancelar', description: '🚫 Cancelar registro pendiente' },
  ];

  try {
    const res = await fetch(`${TELEGRAM_API}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error configurando comandos en Telegram:', err);
    return null;
  }
}

