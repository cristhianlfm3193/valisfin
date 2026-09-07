import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history } = await req.json();
    const systemInstruction = "Eres un asistente financiero amigable para la app ValisFin. Ayudas al usuario a consultar su información financiera y del hogar. Tienes herramientas (tools) para consultar la base de datos. Usa las herramientas siempre que te pregunten sobre datos específicos (carros, tareas, gastos, pagos). Responde de manera concisa y clara en español.";

    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: tools }],
      },
      history: history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    let response = await chat.sendMessage({ message: message });

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
            const { data } = await supabase.from('fixed_payments').select('*').eq('status', 'pending');
            result = data;
          } else if (call.name === 'get_home_tasks') {
            const { data } = await supabase.from('home_tasks').select('*').eq('status', 'pending');
            result = data;
          } else if (call.name === 'get_expenses_summary') {
            // Get current month expenses
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
            const { data } = await supabase.from('daily_expenses').select('*').gte('date', startOfMonth);
            result = data;
          }
        } catch (e: any) {
          result = { error: e.message };
        }

        functionResponseParts.push({
          functionResponse: {
            id: (call as any).id,
            name: call.name,
            response: { output: result ? JSON.stringify(result) : "No se encontraron datos." },
          }
        });
      }

      // Send the tool responses back to the chat
      response = await chat.sendMessage({ message: functionResponseParts });
    }

    const text = response.text || "Lo siento, no pude procesar tu solicitud.";
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error('Error in Assistant API:', error);
    require('fs').writeFileSync('/tmp/valisfin_assistant_error.txt', error.stack || error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
