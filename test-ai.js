import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const text = "Cristhian gastó 15 en el Súper 99 ayer";
const today = new Date().toISOString().split('T')[0];

const responseSchema = {
      type: Type.OBJECT,
      properties: {
        fecha: { type: Type.STRING },
        categoria: { type: Type.STRING },
        detalle: { type: Type.STRING },
        pagador: { type: Type.STRING, enum: ["Cristhian", "Jennifer"] },
        monto: { type: Type.NUMBER },
        uso_tarjeta: { type: Type.BOOLEAN }
      },
      required: ["fecha", "categoria", "detalle", "pagador", "monto", "uso_tarjeta"]
};

const prompt = `Analiza el siguiente texto y extrae la información del gasto.
Texto del usuario: "${text}"
Información de contexto: La fecha de hoy es ${today}.`;

ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
}).then(res => console.log(res.text)).catch(console.error);
