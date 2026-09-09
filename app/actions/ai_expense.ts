'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

export async function analyzeUniversalText(text: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        accion: {
          type: Type.STRING,
          enum: ["gasto", "ingreso", "kilometraje", "mantenimiento_auto", "trabajo_hogar", "meta_ahorro", "pago_fijo", "pendiente_auto"],
          description: "Clasifica la intención del usuario. Usa 'pendiente_auto' si es un trabajo por hacer al auto."
        },
        parametros: {
          type: Type.OBJECT,
          properties: {
            // Campos comunes y Gastos/Ingresos
            fecha: { type: Type.STRING, description: "YYYY-MM-DD. Calcula relativo a la fecha de hoy." },
            monto: { type: Type.NUMBER, description: "Monto de la transacción." },
            detalle: { type: Type.STRING, description: "Concepto o descripción." },
            categoria: { type: Type.STRING, description: "Categoría inferida." },
            pagador: { type: Type.STRING, enum: ["Cristhian", "Jennifer"], description: "Quién pagó o recibió el dinero." },
            uso_tarjeta: { type: Type.BOOLEAN, description: "True si menciona tarjeta, crédito o visa." },
            
            // Campos de Autos (Kilometraje, Mantenimiento, Pendiente)
            vehiculo: { type: Type.STRING, description: "Nombre del vehículo, ej. Yaris, Tucson, Moto." },
            km_lectura: { type: Type.NUMBER, description: "Lectura del odómetro." },
            mantenimiento_tipo: { type: Type.STRING, description: "El tipo de mantenimiento o trabajo a realizar al vehículo." },
            costo_estimado: { type: Type.NUMBER, description: "Costo estimado del mantenimiento o tarea." },
            
            // Campos de Hogar
            hogar_area: { type: Type.STRING, description: "Área de la casa afectada." },
            hogar_prioridad: { type: Type.STRING, enum: ["Normal", "Alta", "Urgente"], description: "Prioridad inferida." },
            
            // Campos de Pagos Fijos y Metas
            obligacion: { type: Type.STRING, description: "Nombre del pago fijo o meta, ej. Tigo Internet, Luz, Ahorro Navideño." }
          }
        }
      },
      required: ["accion", "parametros"]
    };

    const today = new Date().toISOString().split('T')[0];

    const prompt = `Analiza el siguiente texto, clasifica la intención en una de las acciones permitidas y extrae los parámetros relevantes.
La fecha de hoy es: ${today}.

EJEMPLOS DE MAPEO:
- "Cristhian gastó 15 en el Súper 99 ayer": accion="gasto", parametros={pagador: "Cristhian", monto: 15, detalle: "Súper 99", categoria: "Supermercado", fecha: ayer}
- "Cobré 50 por una asesoría": accion="ingreso", parametros={monto: 50, detalle: "Asesoría", pagador: "Cristhian" (si no se especifica)}
- "El Yaris llegó a 209500 km hoy": accion="kilometraje", parametros={vehiculo: "Yaris", km_lectura: 209500, fecha: hoy}
- "Cambiar pastillas del Tucson, cuesta 80": accion="pendiente_auto" (o mantenimiento_auto si ya se hizo), parametros={vehiculo: "Tucson", mantenimiento_tipo: "Cambiar pastillas", costo_estimado: 80}
- "Limpieza de aire en la sala urgente por 40 dolares": accion="trabajo_hogar", parametros={hogar_area: "Sala", detalle: "Limpieza de aire", hogar_prioridad: "Urgente", costo_estimado: 40}
- "Pagué el internet de Tigo hoy por 45": accion="pago_fijo", parametros={obligacion: "Tigo Internet", monto: 45, fecha: hoy}
- "Aboné 20 dolares al ahorro navideño": accion="meta_ahorro", parametros={obligacion: "Ahorro Navideño", monto: 20, fecha: hoy}

Texto del usuario: "${text}"`;

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
    console.error('Error analyzing universal text:', error);
    return { success: false, error: error.message || 'Failed to analyze text' };
  }
}
