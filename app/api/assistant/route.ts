import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models in priority order: primary → fallback
const PRIMARY_MODEL = 'gemini-2.5-flash-lite';
const FALLBACK_MODEL = 'gemini-flash-lite-latest';

const tools = [
  {
    name: 'get_vehicle_info',
    description: 'Get information about the user\'s vehicles, including current mileage (kilometraje) and last update dates.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_upcoming_fixed_payments',
    description: 'Get a list of fixed payments (gastos fijos) that are currently pending.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_home_tasks',
    description: 'Get a list of pending tasks for the home (tareas del hogar pendientes).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_expenses_summary',
    description: 'Get a summary of daily expenses (gastos diarios) for the current month.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  }
];

const systemInstruction = "Eres un asistente financiero amigable para la app ValisFin. Ayudas al usuario a consultar su información financiera y del hogar. Tienes herramientas (tools) para consultar la base de datos. Usa las herramientas siempre que te pregunten sobre datos específicos (carros, tareas, gastos, pagos). Responde de manera concisa y clara en español.";

/**
 * Detects if an error is a quota/rate-limit error (HTTP 429 or similar).
 */
function isQuotaError(error: any): boolean {
  const message = (error?.message || '').toLowerCase();
  const status = error?.status || error?.code || error?.httpStatus;

  return (
    status === 429 ||
    status === '429' ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('resource_exhausted') ||
    message.includes('too many requests') ||
    message.includes('ratequota')
  );
}

/**
 * Executes the full chat flow (send message + handle tool calls) for a given model.
 */
async function runChatWithModel(
  modelName: string,
  message: string,
  history: any[],
  supabase: any
): Promise<string> {
  const chat = ai.chats.create({
    model: modelName,
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: tools }],
    },
    history: history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  });

  let response = await chat.sendMessage({ message });

  // Handle tool calls
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionResponseParts = [];

    for (const call of response.functionCalls) {
      let result: any = null;

      try {
        if (call.name === 'get_vehicle_info') {
          const { data } = await supabase.from('vehicles').select('*');
          result = data;
        } else if (call.name === 'get_upcoming_fixed_payments') {
          const { data } = await supabase.from('fixed_payments').select('*').eq('is_paid', false);
          result = data;
        } else if (call.name === 'get_home_tasks') {
          const { data } = await supabase.from('home_tasks').select('*').neq('status', 'Completado');
          result = data;
        } else if (call.name === 'get_expenses_summary') {
          const d = new Date();
          const startOfMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
          const { data } = await supabase
            .from('daily_expenses')
            .select('*')
            .gte('date', startOfMonth);
          result = data;
        }
      } catch (e: any) {
        result = { error: e.message };
      }

      functionResponseParts.push({
        functionResponse: {
          id: (call as any).id,
          name: call.name,
          response: { output: result ? JSON.stringify(result) : 'No se encontraron datos.' },
        }
      });
    }

    // Send the tool responses back to the model
    response = await chat.sendMessage({ message: functionResponseParts });
  }

  return response.text || 'Lo siento, no pude procesar tu solicitud.';
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history } = await req.json();

    let text: string;
    let usedModel = PRIMARY_MODEL;

    // --- Primary model attempt ---
    try {
      text = await runChatWithModel(PRIMARY_MODEL, message, history, supabase);
    } catch (primaryError: any) {
      console.warn(`[Assistant] Primary model (${PRIMARY_MODEL}) failed:`, primaryError?.message);

      // --- Fallback: only on quota/rate-limit errors ---
      if (isQuotaError(primaryError)) {
        console.info(`[Assistant] Quota error detected. Falling back to ${FALLBACK_MODEL}...`);
        usedModel = FALLBACK_MODEL;
        text = await runChatWithModel(FALLBACK_MODEL, message, history, supabase);
      } else {
        // Non-quota error — re-throw so the outer catch handles it
        throw primaryError;
      }
    }

    console.info(`[Assistant] Response delivered via model: ${usedModel}`);
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error('[Assistant] Unhandled error:', error?.message || error);
    return NextResponse.json(
      { error: 'No se pudo procesar tu mensaje. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
