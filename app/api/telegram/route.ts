import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { 
  sendTelegramMessage, 
  editTelegramMessage, 
  answerCallbackQuery, 
  sendChatAction, 
  isChatAuthorized,
  downloadTelegramImageAsBase64,
  setTelegramBotCommands
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
  getPendingPaymentsInteractive,
  getMonthlyExpensesMessage,
  getItemizedExpensesList,
  getVehiclesMessage,
  getGoalsMessage,
  getHomeTasksMessage,
  getBizMetricsMessage,
  getBizSellersMessage,
  getBizVisitsMessage,
  getRecentReportsMessage,
  searchOperationalReports,
  getComprehensiveReportsMessage,
  getBdrhStatsMessage,
  searchBdrhPerson,
  getValisHubSummaryMessage,
  saveTelegramDraft,
  deleteTelegramDraft,
  commitDraft,
  formatDraftSummaryCard,
  parsearTextoWhatsAppLocal,
  matchPendingFixedPayment,
  parseQuickExpenseLocal,
  parseQuickIncomeLocal,
  classifyAndExtractTransactionAI,
  getValisPersistentKeyboard,
  getRegistrationGuideMessage,
  getFixedPaymentById,
  TelegramDraft
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

      // ── 1.1 REGLA DE ORO: CONFIRMACIÓN Y CANCELACIÓN DE BORRADORES ────────
      if (data === 'draft:commit') {
        const result = await commitDraft(chatId);
        await editTelegramMessage(chatId, messageId, result.text);
        return NextResponse.json({ ok: true });
      }

      if (data === 'draft:cancel') {
        await deleteTelegramDraft(chatId);
        await editTelegramMessage(
          chatId,
          messageId,
          `🚫 <b>Registro cancelado</b>. No se guardó ningún dato en la base de datos.`
        );
        return NextResponse.json({ ok: true });
      }

      // ── 1.2 PAGO FIJO SELECCIONADO POR BOTÓN INTERACTIVO ─────────────────
      if (data.startsWith('pay_fp:')) {
        const paymentId = data.replace('pay_fp:', '');
        const payment = await getFixedPaymentById(paymentId);
        if (!payment) {
          await editTelegramMessage(chatId, messageId, '❌ No se encontró el pago fijo especificado.');
          return NextResponse.json({ ok: true });
        }

        const draft: TelegramDraft = {
          tipo: 'pago_fijo',
          origen: 'boton_inline',
          fecha: new Date().toISOString().split('T')[0],
          payment_id: payment.id,
          pago_titulo: payment.title,
          pago_periodo: payment.period,
          monto: Number(payment.amount || 0)
        };

        await saveTelegramDraft(chatId, draft);
        const { text: summaryText, replyMarkup } = formatDraftSummaryCard(draft);
        await editTelegramMessage(chatId, messageId, summaryText, replyMarkup);
        return NextResponse.json({ ok: true });
      }

      // ── 1.3 DESPACHO DE NAVEGACIÓN DE MENÚS ──────────────────────────────
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
        const res = await getPendingPaymentsInteractive();
        await editTelegramMessage(chatId, messageId, res.text, res.replyMarkup || getBackKeyboard('valisfin'));
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
        const text = getRegistrationGuideMessage();
        await editTelegramMessage(chatId, messageId, text, getMainMenuKeyboard());
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Manejo de Mensajes (Fotos y Texto)
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || '').trim();
      const photo = msg.photo;
      const caption = (msg.caption || '').trim();

      if (!chatId || (!text && (!photo || photo.length === 0))) {
        return NextResponse.json({ ok: true });
      }

      if (!isChatAuthorized(chatId)) {
        await sendTelegramMessage(
          chatId,
          `⛔ <b>Acceso Restringido</b>\nTu Chat ID es: <code>${chatId}</code>\n\nPara activar el bot para tu usuario, agrega este ID a la variable de entorno <code>TELEGRAM_ALLOWED_CHAT_IDS</code>.`
        );
        return NextResponse.json({ ok: true });
      }

      // ── 2.1 PROCESAMIENTO DE FOTOS (FACTURAS / RECIBOS CON GEMINI VISION) ──
      if (photo && photo.length > 0) {
        await sendChatAction(chatId, 'typing');
        const photoObj = photo[photo.length - 1]; // Imagen de mayor resolución
        const downloaded = await downloadTelegramImageAsBase64(photoObj.file_id);

        if (!downloaded) {
          await sendTelegramMessage(
            chatId,
            '❌ No se pudo descargar la imagen desde Telegram. Por favor intenta enviarla de nuevo.'
          );
          return NextResponse.json({ ok: true });
        }

        const today = new Date().toISOString().split('T')[0];
        const prompt = `Analiza este ticket, factura o recibo de compra en Panamá.
INSTRUCCIONES CRÍTICAS:
1. comercio: Nombre de la empresa, comercio o negocio (generalmente en la cabecera superior).
2. detalle: Breve descripción de los artículos comprados. Si el usuario escribió una nota ("${caption}"), incorpórala.
3. monto_total: Identifica el monto total a pagar (TOTAL A PAGAR, TOTAL IMPORTE, etc.) en dólares/balboas.
4. categoria: Infiere la categoría lógica (Supermercado, Restaurante, Farmacia, Ferretería, Tecnología, Servicios Básicos, Transporte, etc.).
5. fecha: Busca la fecha impresa en el documento (formato panameño DD/MM/YYYY) y conviértela estrictamente a YYYY-MM-DD. Si no hay fecha legible en la imagen, usa '${today}'.`;

        const schema: Schema = {
          type: Type.OBJECT,
          properties: {
            comercio: { type: Type.STRING, description: "Nombre del negocio emisor" },
            detalle: { type: Type.STRING, description: "Resumen de lo comprado" },
            monto_total: { type: Type.NUMBER, description: "Monto total a pagar" },
            categoria: { type: Type.STRING, description: "Categoría de gasto" },
            fecha: { type: Type.STRING, description: "Fecha en formato YYYY-MM-DD" }
          },
          required: ["comercio", "detalle", "monto_total", "categoria", "fecha"]
        };

        try {
          const aiRes = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: [
              {
                role: 'user',
                parts: [
                  { inlineData: { data: downloaded.base64, mimeType: downloaded.mimeType } },
                  { text: prompt }
                ]
              }
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: schema,
            }
          });

          const parsed = JSON.parse(aiRes.text || '{}');
          if (!parsed.monto_total || parsed.monto_total <= 0) {
            await sendTelegramMessage(
              chatId,
              '⚠️ No pude detectar con precisión el monto total de la factura. Asegúrate de que la foto esté bien iluminada o regístralo escribiendo: <code>Gasto 15 Súper 99</code>.'
            );
            return NextResponse.json({ ok: true });
          }

          const draft: TelegramDraft = {
            tipo: 'gasto',
            origen: 'foto_gemini',
            fecha: parsed.fecha || today,
            monto: Number(parsed.monto_total),
            detalle: `${parsed.comercio} - ${parsed.detalle || 'Factura'}`,
            categoria: parsed.categoria || 'Varios',
            profile_id: 'edc938dc-9fbc-4573-b007-0bdb95114f95', // Cristhian Fuentes
            is_credit_card: false,
          };

          await saveTelegramDraft(chatId, draft);
          const { text: summaryText, replyMarkup } = formatDraftSummaryCard(draft);
          await sendTelegramMessage(chatId, summaryText, replyMarkup);
          return NextResponse.json({ ok: true });
        } catch (aiPhotoErr) {
          console.error('Error analizando foto con Gemini Vision:', aiPhotoErr);
          await sendTelegramMessage(
            chatId,
            '❌ Ocurrió un error al analizar la factura con IA. Intenta de nuevo o escríbelo en texto: <code>Gasto 20 Farmacia</code>.'
          );
          return NextResponse.json({ ok: true });
        }
      }

      // ── 2.2 BOTONES DEL TECLADO PERSISTENTE INFERIOR ────────────────────
      if (text === '📊 Menú ValisHub') {
        await sendTelegramMessage(
          chatId,
          `🏢 <b>Menú Principal • ValisHub</b>\n\nSelecciona el ecosistema que deseas consultar en tiempo real:`,
          getMainMenuKeyboard()
        );
        return NextResponse.json({ ok: true });
      }

      if (text === '💳 Pagos Pendientes' || text === '/pagos') {
        const res = await getPendingPaymentsInteractive();
        await sendTelegramMessage(chatId, res.text, res.replyMarkup || getBackKeyboard('valisfin'));
        return NextResponse.json({ ok: true });
      }

      if (text === '📈 Reporte Keiko' || text === '/keiko' || text === '/biz') {
        const metrics = await getBizMetricsMessage();
        const sellers = await getBizSellersMessage();
        await sendTelegramMessage(chatId, `${metrics}\n\n${sellers}`, getBackKeyboard('valisbiz'));
        return NextResponse.json({ ok: true });
      }

      if (text === '💡 Guía de Registro' || text === '/ayuda') {
        const guide = getRegistrationGuideMessage();
        await sendTelegramMessage(chatId, guide, getMainMenuKeyboard());
        return NextResponse.json({ ok: true });
      }

      // Cancelación explícita de borrador
      if (text === '/cancelar' || text.toLowerCase() === 'cancelar') {
        await deleteTelegramDraft(chatId);
        await sendTelegramMessage(chatId, `🚫 <b>Borrador cancelado</b>. No hay ningún registro pendiente.`);
        return NextResponse.json({ ok: true });
      }

      // Comando /start o /menu
      if (text === '/start' || text === '/menu') {
        setTelegramBotCommands().catch(console.error);

        // Enviar teclado persistente en pantalla y menú interactivo
        await sendTelegramMessage(
          chatId,
          `👋 <b>¡Hola Cristhian! Bienvenido a ValisHub Bot</b>\n\n` +
          `🆔 Tu Chat ID: <code>${chatId}</code>\n\n` +
          `✅ Tienes botones rápidos permanentes en la parte inferior de tu pantalla para consultas en 1 toque.`,
          getValisPersistentKeyboard()
        );

        await sendTelegramMessage(
          chatId,
          `Elige el módulo que deseas consultar al instante (0 tokens de IA):`,
          getMainMenuKeyboard()
        );
        return NextResponse.json({ ok: true });
      }

      // ── 2.3 OPCIÓN B: REGISTRAR PAGOS FIJOS POR TEXTO (0 TOKENS) ─────────
      if (text.startsWith('/pagado') || /^ya\s+pagu[eé]/i.test(text) || /^pagu[eé]\s+(el|la|mi)?\s*/i.test(text)) {
        const paymentDraft = await matchPendingFixedPayment(text);
        if (paymentDraft) {
          await saveTelegramDraft(chatId, paymentDraft);
          const { text: summaryText, replyMarkup } = formatDraftSummaryCard(paymentDraft);
          await sendTelegramMessage(chatId, summaryText, replyMarkup);
          return NextResponse.json({ ok: true });
        } else {
          const res = await getPendingPaymentsInteractive();
          await sendTelegramMessage(
            chatId,
            `⚠️ No encontré ningún pago fijo pendiente que coincida con esa búsqueda este mes.\n\nAquí tienes la lista actual de compromisos pendientes:`,
            res.replyMarkup
          );
          return NextResponse.json({ ok: true });
        }
      }

      // ── 2.4 REPORTES DE VENTAS KEIKO (PARSER LOCAL WHATSAPP - 0 TOKENS) ───
      const whatsappSaleDraft = parsearTextoWhatsAppLocal(text);
      if (whatsappSaleDraft) {
        await saveTelegramDraft(chatId, whatsappSaleDraft);
        const { text: summaryText, replyMarkup } = formatDraftSummaryCard(whatsappSaleDraft);
        await sendTelegramMessage(chatId, summaryText, replyMarkup);
        return NextResponse.json({ ok: true });
      }

      // ── 2.5 REGISTRO RÁPIDO DE GASTOS (PARSER LOCAL - 0 TOKENS) ───────────
      const quickExpenseDraft = parseQuickExpenseLocal(text);
      if (quickExpenseDraft) {
        await saveTelegramDraft(chatId, quickExpenseDraft);
        const { text: summaryText, replyMarkup } = formatDraftSummaryCard(quickExpenseDraft);
        await sendTelegramMessage(chatId, summaryText, replyMarkup);
        return NextResponse.json({ ok: true });
      }

      // ── 2.6 REGISTRO RÁPIDO DE INGRESOS / VENTAS PROPIAS (PARSER LOCAL - 0 TOKENS) ──
      const quickIncomeDraft = parseQuickIncomeLocal(text);
      if (quickIncomeDraft) {
        await saveTelegramDraft(chatId, quickIncomeDraft);
        const { text: summaryText, replyMarkup } = formatDraftSummaryCard(quickIncomeDraft);
        await sendTelegramMessage(chatId, summaryText, replyMarkup);
        return NextResponse.json({ ok: true });
      }

      // ── 2.7 CLASIFICADOR INTELIGENTE DE TRANSACCIONES (FALLBACK CON IA) ──
      const aiTransactionDraft = await classifyAndExtractTransactionAI(text);
      if (aiTransactionDraft) {
        await saveTelegramDraft(chatId, aiTransactionDraft);
        const { text: summaryText, replyMarkup } = formatDraftSummaryCard(aiTransactionDraft);
        await sendTelegramMessage(chatId, summaryText, replyMarkup);
        return NextResponse.json({ ok: true });
      }

      // Compatibilidad con comando legacy /gasto monto categoria detalle (con confirmación previa)
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

        const draft: TelegramDraft = {
          tipo: 'gasto',
          origen: 'texto_local',
          fecha: new Date().toISOString().split('T')[0],
          monto: amount,
          categoria: category,
          detalle: detail,
          profile_id: 'edc938dc-9fbc-4573-b007-0bdb95114f95',
          is_credit_card: false,
        };

        await saveTelegramDraft(chatId, draft);
        const { text: summaryText, replyMarkup } = formatDraftSummaryCard(draft);
        await sendTelegramMessage(chatId, summaryText, replyMarkup);
        return NextResponse.json({ ok: true });
      }

      // Atajos directos por comando
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
      if (text === '/an') {
        const res = await getRecentReportsMessage();
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisan'));
        return NextResponse.json({ ok: true });
      }

      // Búsqueda en BD-RH por comandos explícitos
      if (
        text.startsWith('/cip ') || 
        text.startsWith('/pos ') || 
        text.startsWith('/posicion ') || 
        text.startsWith('/cedula ') || 
        text.startsWith('/persona ') ||
        text.startsWith('/buscar ')
      ) {
        const term = text.split(' ').slice(1).join(' ');
        const res = await searchBdrhPerson(term);
        await sendTelegramMessage(chatId, res, getBackKeyboard('valisan'));
        return NextResponse.json({ ok: true });
      }

      // 🔍 Búsqueda directa inteligente en BD-RH (sin IA)
      // 1. Si el usuario escribe algo como "posicion de X", "placa de X", "quien es X"
      const bdrhIntentMatch = text.match(/^(?:tiene[sn]?\s+(?:la|el|los|las)\s+)?(?:placa|posici[oó]n|unidad|c[eé]dula|datos|departamento|grupo\s*pd|direcci[oó]n|rango)\s+(?:de|del)?\s+(.+)$/i) || text.match(/^qui[eé]n\s+es\s+(.+)$/i);
      
      let termToSearch = '';
      if (bdrhIntentMatch && bdrhIntentMatch[1]) {
        termToSearch = bdrhIntentMatch[1].trim();
      } else {
        // 2. O si el usuario escribe solo un nombre, cédula o posición (heurística básica)
        const isQuestionOrGreeting = /^(hola|buenas|buenos|que|qué|cual|cuál|como|cómo|donde|dónde|cuanto|cuánto|quien|quién|dime|por qué|porque)\b/i.test(text);
        if (!isQuestionOrGreeting && text.length >= 3 && text.length <= 40 && !text.startsWith('/')) {
          termToSearch = text.trim();
        }
      }

      if (termToSearch) {
        // Limpiar signos de interrogación si los hay
        termToSearch = termToSearch.replace(/[¿?]/g, '').trim();
        const directMatch = await searchBdrhPerson(termToSearch);
        if (!directMatch.startsWith('🔍 No se encontraron')) {
          await sendTelegramMessage(chatId, directMatch, getBackKeyboard('valisan'));
          return NextResponse.json({ ok: true });
        } else if (bdrhIntentMatch) {
          // Si el usuario explícitamente preguntó por una placa/posición de alguien y no se encontró,
          // respondemos directamente sin pasar a la IA para evitar alucinaciones.
          await sendTelegramMessage(chatId, `🔍 No encontré a nadie con el término: *${termToSearch}* en la BD-RH. Revisa la ortografía o intenta buscar por cédula/posición.`, getBackKeyboard('valisan'));
          return NextResponse.json({ ok: true });
        }
      }

      // ─────────────────────────────────────────────────────────────────────────
      // 💬 MODO HÍBRIDO CON IA (GEMINI): Preguntas abiertas y análisis
      // ─────────────────────────────────────────────────────────────────────────
      await sendChatAction(chatId, 'typing');

      try {
        // Obtenemos contexto integral de la base de datos para nutrir a Gemini
        const [payments, expenses, itemizedExpenses, vehicles, bizMetrics, sellers, goals, reports] = await Promise.all([
          getPendingPaymentsMessage(),
          getMonthlyExpensesMessage(),
          getItemizedExpensesList(),
          getVehiclesMessage(),
          getBizMetricsMessage(),
          getBizSellersMessage(),
          getGoalsMessage(),
          getRecentReportsMessage(),
        ]);

        // Búsqueda contextual integral de reportes operativos para análisis estadístico por la IA
        let specificReportsContext = '';
        const isAskingAboutReports = /(reporte|novedad|recorrido|operativo|aipp|turno|hora|fecha|ayer|hoy|cuanto|cuánto|semana|mes|\b\d{1,2}\b)/i.test(text);
        if (isAskingAboutReports) {
          const comprehensiveReports = await getComprehensiveReportsMessage(30);
          specificReportsContext = `\n--- BASE DE DATOS CRUDA DE REPORTES OPERATIVOS (PARA CONTEO Y ANÁLISIS DE LA IA) ---\n${comprehensiveReports}\n`;
        }

        // Si la pregunta menciona a una persona o término específico, buscamos en BD-RH
        let bdrhContext = '';
        const searchTerms = text
          .replace(/[?¿!¡,.:;]/g, '')
          .split(' ')
          .filter((w: string) => w.length >= 3 && !/^(cual|cuál|como|cómo|donde|dónde|quien|quién|cuanto|cuánto|placa|placas|auto|autos|carro|carros|posicion|posición|vehiculo|vehículos|dime|saber|favor|por|reporte|reportes|vendedor|vendedores|gasto|gastos|compra|compras|fijos|fijo)$/i.test(w));
        
        if (searchTerms.length > 0) {
          const candidateTerm = searchTerms.join(' ');
          const candidateRes = await searchBdrhPerson(candidateTerm);
          if (!candidateRes.startsWith('🔍 No se encontraron')) {
            bdrhContext = `\n--- FICHA ENCONTRADA EN BD-RH ---\n${candidateRes}\n`;
          } else if (searchTerms.length > 1) {
            const fallbackRes = await searchBdrhPerson(searchTerms[0]);
            if (!fallbackRes.startsWith('🔍 No se encontraron')) {
              bdrhContext = `\n--- FICHA ENCONTRADA EN BD-RH ---\n${fallbackRes}\n`;
            }
          }
        }

        const systemPrompt = 
          `Eres el asistente inteligente oficial de ValisHub en Telegram para Cristhian Fuentes.\n` +
          `Tienes acceso total en tiempo real a los tres ecosistemas:\n` +
          `1. ValisFin: Finanzas familiares, pagos pendientes/completados, todas las compras diarias con fechas y descripciones exactas, metas de ahorro y vehículos (Toyota Yaris de Cristhian y Hyundai Tucson de Jennifer, con odómetros, placas, próximos servicios y kilómetros restantes exactos).\n` +
          `2. ValisBiz: Supervisión de ventas Keiko (cuotas, avance global, rendimiento individual y estados de Joseph Domínguez, Carolina Sucre, Enrique del Rosario y Andrés Chávez, y visitas a locales).\n` +
          `3. ValisAN: Inteligencia y operaciones AIPP (reportes operativos detallados con turnos, horas, áreas, conductores AVSEC y unidades aeronavales) y personal BD-RH (con números de posición, cargos, salarios y departamentos).\n\n` +
          `--- VALISFIN: ESTADO DE PAGOS FIJOS Y DEUDAS PENDIENTES ---\n${payments}\n\n` +
          `--- VALISFIN: RESUMEN DE GASTOS POR CATEGORÍA ---\n${expenses}\n\n` +
          `--- VALISFIN: TODAS LAS COMPRAS Y GASTOS DEL MES (ITEMIZADO CON FECHAS Y DETALLE) ---\n${itemizedExpenses}\n\n` +
          `--- VALISFIN: VEHÍCULOS, PLACAS, ODÓMETRO Y MANTENIMIENTOS ---\n${vehicles}\n\n` +
          `--- VALISFIN: METAS DE AHORRO ---\n${goals}\n\n` +
          `--- VALISBIZ: SUPERVISIÓN Y VENTAS KEIKO ---\n${bizMetrics}\n\n` +
          `--- VALISBIZ: DETALLE POR CADA VENDEDOR ---\n${sellers}\n\n` +
          `--- VALISAN: REPORTES AIPP ---\n${reports}\n` +
          `${specificReportsContext}\n` +
          `${bdrhContext}\n` +
          `INSTRUCCIONES DE RESPUESTA:\n` +
          `- Responde de forma muy concisa, precisa, directa y amable en español para Telegram (usa negritas o viñetas cuando convenga).\n` +
          `- Si preguntan qué cosas ha comprado o qué gastos ha hecho de una categoría específica (ej: Tecnología, Supermercado, Salud, Restaurantes, etc.), revisa la lista itemizada arriba y lista cada compra con su fecha, descripción y monto exacto, y calcula el total.\n` +
          `- Si preguntan por los gastos fijos que no ha pagado o cuánto debe, lista los pagos pendientes y la suma total exacta que debe.\n` +
          `- Si preguntan por kilometraje o cuánto falta para el mantenimiento de un auto, da las cifras exactas calculadas arriba.\n` +
          `- Si preguntan por un vendedor específico o cómo van las ventas, usa los datos individuales de ValisBiz.\n` +
          `- Si preguntan por metas de ahorro, usa los datos de ValisFin.\n` +
          `- Si preguntan por reportes operativos de tal día o turno, menciona el detalle de la narrativa, áreas recorridas, vehículo y personal.\n` +
          `- Si el usuario pide contar o filtrar reportes ('cuántos reportes hubo ayer', 'cuántas veces reportó X', 'cuántos recorridos hubo'), actúa como un analista de datos: revisa cuidadosamente la 'BASE DE DATOS CRUDA DE REPORTES OPERATIVOS', filtra por la fecha/persona/término, cuenta las coincidencias exactas matemáticamente y da el número total junto a un breve desglose.\n` +
          `- Si preguntan por personas, posiciones o cédulas, usa los datos de BD-RH.\n` +
          `- REGLA ESTRICTA DE SEGURIDAD: TÚ NO TIENES CAPACIDAD DE ESCRIBIR EN LA BASE DE DATOS DIRECTAMENTE. NUNCA respondas diciendo 'He registrado', 'Ya lo guardé' o similares. Si el usuario intenta registrar un gasto, venta o ingreso y no se activó la tarjeta interactiva, dile que use el formato directo (ej: 'Gasto 15 comida' o 'Vendí licencia a 1 dólar') para que el sistema le genere la tarjeta de confirmación obligatoria con botón.`;

        let reply = '';
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nPregunta de Cristhian: ${text}` }] }
            ],
          });
          reply = response.text || '';
        } catch (mErr) {
          console.warn('Fallback a gemini-3.6-flash:', mErr);
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nPregunta de Cristhian: ${text}` }] }
            ],
          });
          reply = fallbackResponse.text || '';
        }

        if (!reply) {
          reply = 'No pude procesar una respuesta en este momento. Por favor intenta de nuevo.';
        }

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
