import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { 
  sendTelegramMessage, 
  editTelegramMessage, 
  answerCallbackQuery, 
  sendChatAction, 
  isChatAuthorized 
} from '@/lib/telegram/bot';
import { 
  getMainMenuKeyboard, 
  getValisFinKeyboard, 
  getValisBizKeyboard, 
  getValisANKeyboard, 
  getBackKeyboard 
} from '@/lib/telegram/menus';
import {
  getPendingPaymentsMessage,
  getMonthlyExpensesMessage,
  getVehiclesMessage,
  getGoalsMessage,
  getHomeTasksMessage,
  getBizMetricsMessage,
  getBizSellersMessage,
  getBizVisitsMessage,
  getRecentReportsMessage,
  getBdrhStatsMessage,
  searchBdrhPerson,
  getValisHubSummaryMessage,
  registerQuickExpense
} from '@/lib/telegram/queries';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // 1. Manejo de Botones (Callback Queries)
    if (update.callback_query) {
      const cq = update.callback_query;
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;
      const data = cq.data as string;

      // Quitar el indicador de carga del botón
      await answerCallbackQuery(cq.id);

      if (!chatId || !messageId) {
        return NextResponse.json({ ok: true });
      }

      if (!isChatAuthorized(chatId)) {
        await editTelegramMessage(
          chatId,
          messageId,
          `⛔ <b>Acceso Restringido</b>\nTu Chat ID es: <code>${chatId}</code>\nPara autorizar tu cuenta, agrega este ID a <code>TELEGRAM_ALLOWED_CHAT_IDS</code> en el proyecto.`
        );
        return NextResponse.json({ ok: true });
      }

      // Despacho de Navegación de Menús
      if (data === 'menu:main') {
        await editTelegramMessage(
          chatId,
          messageId,
          `🏢 <b>Menú Principal • ValisHub</b>\n\nSelecciona el ecosistema que deseas consultar en tiempo real:`,
          getMainMenuKeyboard()
        );
      } else if (data === 'menu:valisfin') {
        await editTelegramMessage(
          chatId,
          messageId,
          `🟢 <b>Ecosistema ValisFin • Finanzas & Hogar</b>\n\nElige una consulta rápida (0 tokens):`,
          getValisFinKeyboard()
        );
      } else if (data === 'menu:valisbiz') {
        await editTelegramMessage(
          chatId,
          messageId,
          `🔴 <b>Ecosistema ValisBiz • Supervisión Keiko</b>\n\nElige una consulta rápida (0 tokens):`,
          getValisBizKeyboard()
        );
      } else if (data === 'menu:valisan') {
        await editTelegramMessage(
          chatId,
          messageId,
          `🔵 <b>Ecosistema ValisAN • Inteligencia & BD-RH</b>\n\nElige una consulta rápida (0 tokens):`,
          getValisANKeyboard()
        );
      } 
      // Despacho de Consultas ValisFin
      else if (data === 'valisfin:pagos') {
        const text = await getPendingPaymentsMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisfin'));
      } else if (data === 'valisfin:gastos') {
        const text = await getMonthlyExpensesMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisfin'));
      } else if (data === 'valisfin:carros') {
        const text = await getVehiclesMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisfin'));
      } else if (data === 'valisfin:metas') {
        const text = await getGoalsMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisfin'));
      } else if (data === 'valisfin:hogar') {
        const text = await getHomeTasksMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisfin'));
      }
      // Despacho de Consultas ValisBiz
      else if (data === 'valisbiz:metricas') {
        const text = await getBizMetricsMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisbiz'));
      } else if (data === 'valisbiz:vendedores') {
        const text = await getBizSellersMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisbiz'));
      } else if (data === 'valisbiz:visitas') {
        const text = await getBizVisitsMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisbiz'));
      }
      // Despacho de Consultas ValisAN
      else if (data === 'valisan:reportes') {
        const text = await getRecentReportsMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisan'));
      } else if (data === 'valisan:bdrh_stats') {
        const text = await getBdrhStatsMessage();
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisan'));
      } else if (data === 'valisan:buscar_ayuda') {
        const text = `🔍 <b>Búsqueda en Personal BD-RH</b>\n\nPuedes buscar a cualquier miembro escribiendo directamente en el chat:\n\n• <code>/cip 12345</code> (buscar por número de CIP)\n• <code>/cedula 8-123-456</code> (buscar por cédula)\n• <code>/persona Nombre</code> (buscar por nombre)`;
        await editTelegramMessage(chatId, messageId, text, getBackKeyboard('valisan'));
      }
      // Resumen y Ayuda Global
      else if (data === 'valishub:resumen') {
        const text = await getValisHubSummaryMessage();
        await editTelegramMessage(chatId, messageId, text, getMainMenuKeyboard());
      } else if (data === 'valishub:ayuda') {
        const text = `💡 <b>Atajos Rápidos en ValisHub Bot:</b>\n\n` +
          `• <code>/pagos</code> - Pagos fijos pendientes\n` +
          `• <code>/gastos</code> - Resumen de gastos del mes\n` +
          `• <code>/carros</code> - Kilometraje y mantenimientos\n` +
          `• <code>/metas</code> - Metas de ahorro\n` +
          `• <code>/biz</code> - Métricas de ventas Keiko\n` +
          `• <code>/an</code> - Reportes de ValisAN\n` +
          `• <code>/cip 12345</code> - Búsqueda en BD-RH\n` +
          `• <code>/gasto 15.50 Super Pan y leche</code> - Registrar gasto rápido\n\n` +
          `<i>También puedes hacerme cualquier pregunta abierta en texto si necesitas un análisis financiero con IA.</i>`;
        await editTelegramMessage(chatId, messageId, text, getMainMenuKeyboard());
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Manejo de Mensajes de Texto
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || '').trim();

      if (!chatId || !text) {
        return NextResponse.json({ ok: true });
      }

      if (!isChatAuthorized(chatId)) {
        await sendTelegramMessage(
          chatId,
          `⛔ <b>Acceso Restringido</b>\nTu Chat ID es: <code>${chatId}</code>\n\nPara activar el bot para tu usuario, agrega este ID a la variable de entorno <code>TELEGRAM_ALLOWED_CHAT_IDS</code>.`
        );
        return NextResponse.json({ ok: true });
      }

      // Comando /start o /menu
      if (text === '/start' || text === '/menu') {
        await sendTelegramMessage(
          chatId,
          `👋 <b>¡Hola Cristhian! Bienvenido a ValisHub Bot</b>\n\n` +
          `🆔 Tu Chat ID: <code>${chatId}</code>\n\n` +
          `Elige el módulo que deseas consultar al instante (0 tokens de IA):`,
          getMainMenuKeyboard()
        );
        return NextResponse.json({ ok: true });
      }

      // Atajos directos por comando
      if (text === '/pagos') {
        const res = await getPendingPaymentsMessage();
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisfin'));
        return NextResponse.json({ ok: true });
      }
      if (text === '/gastos') {
        const res = await getMonthlyExpensesMessage();
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisfin'));
        return NextResponse.json({ ok: true });
      }
      if (text === '/carros' || text === '/vehiculos') {
        const res = await getVehiclesMessage();
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisfin'));
        return NextResponse.json({ ok: true });
      }
      if (text === '/metas') {
        const res = await getGoalsMessage();
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisfin'));
        return NextResponse.json({ ok: true });
      }
      if (text === '/biz') {
        const res = await getBizMetricsMessage();
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisbiz'));
        return NextResponse.json({ ok: true });
      }
      if (text === '/an') {
        const res = await getRecentReportsMessage();
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisan'));
        return NextResponse.json({ ok: true });
      }

      // Búsqueda en BD-RH
      if (text.startsWith('/cip ') || text.startsWith('/cedula ') || text.startsWith('/persona ')) {
        const term = text.split(' ').slice(1).join(' ');
        const res = await searchBdrhPerson(term);
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisan'));
        return NextResponse.json({ ok: true });
      }

      // Registro rápido de gasto: /gasto 12.50 Supermercado Compras
      if (text.startsWith('/gasto ')) {
        const parts = text.replace('/gasto ', '').trim().split(' ');
        const amount = parseFloat(parts[0]);
        if (isNaN(amount) || amount <= 0) {
          await sendTelegramMessage(
            chatId,
            `⚠️ Formato incorrecto. Ejemplo de uso:\n<code>/gasto 15.50 Supermercado Pan y leche</code>`
          );
          return NextResponse.json({ ok: true });
        }
        const category = parts[1] || 'Varios';
        const detail = parts.slice(2).join(' ') || 'Gasto registrado vía Telegram';

        const res = await registerQuickExpense(amount, category, detail);
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisfin'));
        return NextResponse.json({ ok: true });
      }

      // ─────────────────────────────────────────────────────────────────────────
      // 💬 MODO HÍBRIDO CON IA (GEMINI): Cuando el usuario escribe preguntas libres
      // ─────────────────────────────────────────────────────────────────────────
      await sendChatAction(chatId, 'typing');

      try {
        // Obtenemos contexto rápido de la base de datos para nutrir a Gemini
        const [payments, expenses, bizMetrics] = await Promise.all([
          getPendingPaymentsMessage(),
          getMonthlyExpensesMessage(),
          getBizMetricsMessage(),
        ]);

        const systemPrompt = 
          `Eres el asistente inteligente oficial de ValisHub en Telegram para Cristhian Fuentes.\n` +
          `Tienes acceso a los datos en vivo de ValisFin, ValisBiz y ValisAN.\n` +
          `Aquí tienes los datos actuales:\n\n` +
          `--- DATOS VALISFIN ---\n${payments}\n\n${expenses}\n\n` +
          `--- DATOS VALISBIZ ---\n${bizMetrics}\n\n` +
          `INSTRUCCIONES: Responde de forma muy concisa, clara, profesional y amable en español (ideal para leer en Telegram). ` +
          `No te extiendas innecesariamente. Si te piden consejos o análisis, usa los números reales proporcionados arriba.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nPregunta del usuario: ${text}` }] }
          ],
        });

        const reply = response.text || 'No pude generar una respuesta en este momento.';
        await sendTelegramMessage(chatId, reply, getBackKeyboard());
      } catch (aiErr: any) {
        console.error('Error en Gemini Telegram Assistant:', aiErr);
        await sendTelegramMessage(
          chatId,
          `⚠️ Tuve una pequeña dificultad al conectar con la IA. Puedes seguir usando los botones directos del menú sin problemas:`,
          getMainMenuKeyboard()
        );
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error procesando webhook de Telegram:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 200 }); // Siempre 200 a Telegram
  }
}
