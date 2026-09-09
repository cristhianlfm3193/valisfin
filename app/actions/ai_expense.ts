'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

export async function analyzeExpenseText(text: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Define the schema for the expense
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        fecha: {
          type: Type.STRING,
          description: "La fecha del gasto en formato YYYY-MM-DD. Calcula fechas relativas (ayer, hoy) tomando como base el día actual. Si no se especifica, usa la fecha de hoy."
        },
        categoria: {
          type: Type.STRING,
          description: "La categoría del gasto, inferida por el comercio o detalle (ej. Supermercado, Comida, Transporte, Ropa, Servicios)."
        },
        detalle: {
          type: Type.STRING,
          description: "El nombre del comercio, tienda o la descripción del gasto (ej. Súper 99, McDonalds, Gasolina)."
        },
        pagador: {
          type: Type.STRING,
          enum: ["Cristhian", "Jennifer"],
          description: "El nombre de la persona que realizó el gasto. Debe ser 'Cristhian' o 'Jennifer'. Infiérelo si el texto lo menciona."
        },
        monto: {
          type: Type.NUMBER,
          description: "El monto gastado en número (ej. 15, 15.50)."
        },
        uso_tarjeta: {
          type: Type.BOOLEAN,
          description: "Devuelve false por defecto, a menos que el usuario mencione palabras como 'tarjeta', 'crédito', 'visa', 'mastercard' explícitamente, en ese caso devuelve true."
        }
      },
      required: ["fecha", "categoria", "detalle", "pagador", "monto", "uso_tarjeta"]
    };

    // Calculate today's date so the model has context for "ayer", "hoy", etc.
    const today = new Date().toISOString().split('T')[0];

    const prompt = `Analiza el siguiente texto y extrae la información del gasto.
Texto del usuario: "${text}"
Información de contexto: La fecha de hoy es ${today}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    if (!response.text) {
      return { success: false, error: 'No se pudo generar la respuesta de la IA' };
    }

    const parsedData = JSON.parse(response.text);

    return { 
      success: true, 
      data: parsedData 
    };

  } catch (error: any) {
    console.error('Error analyzing expense text:', error);
    return { success: false, error: error.message || 'Failed to analyze text' };
  }
}
