'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

export async function analyzeUniversalText(text: string, base64Data?: string, mimeType?: string) {
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
          enum: ["gasto", "ingreso", "kilometraje", "mantenimiento_auto", "trabajo_hogar", "meta_ahorro", "pago_fijo", "pendiente_auto", "desconocido"],
          description: "Clasifica la intención del usuario. Usa 'pendiente_auto' si es un trabajo por hacer al auto. Usa 'desconocido' si el texto no tiene relación con el sistema."
        },
        parametros: {
          type: Type.OBJECT,
          properties: {
            // Campos comunes y Gastos/Ingresos
            fecha: { type: Type.STRING, description: "YYYY-MM-DD. PRIORIDAD MÁXIMA: Si hay imagen o PDF, lee el campo 'FECHA:', 'Date:', 'Fecha de emisión:' o similar que aparezca impreso en el documento y conviértelo a formato YYYY-MM-DD. NUNCA uses la fecha de hoy si el documento tiene una fecha visible. Ejemplo: si el documento dice 'FECHA: 04/12/2024', devuelve '2024-12-04'. Solo usa la fecha de hoy como último recurso si no encuentras ninguna fecha en el documento." },
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

    const prompt = `Analiza el siguiente texto y/o imagen/PDF adjunto, clasifica la intención en una de las acciones permitidas y extrae los parámetros relevantes.
La fecha de hoy es: ${today}.

REGLAS ESTRICTAS PARA FACTURAS/RECIBOS (IMÁGENES/PDF):
1. Si recibes una imagen o PDF de una factura con múltiples artículos, NO los registres por separado. Suma o identifica el MONTO TOTAL a pagar (busca campos como 'TOTAL A PAGAR', 'TOTAL IMPORTE', 'GRAND TOTAL').
2. NOMBRE DEL COMERCIO (DETALLE): Lee el nombre de la empresa/negocio que aparece en la PARTE SUPERIOR del recibo (generalmente en la cabecera/encabezado en letras grandes). Luego agrega un guión y un resumen de los artículos. Ejemplo: si el encabezado dice 'DISTRIBUIDORA IRIS PANAMA' y vendió bandejas de aluminio → detalle = 'Distribuidora Iris Panamá - Bandejas de aluminio extra grande'.
3. CATEGORÍA: Infiere la categoría lógica según el tipo de negocio y productos (ej: ferretería, farmacia, supermercado, restaurante, tecnología).
4. Devuelve la acción "gasto" y los parámetros correspondientes para pre-llenar el modal de Registrar Gasto.
5. FECHA OBLIGATORIA: Busca en la imagen el campo que diga 'FECHA:', 'FECHA DE EMISION:', 'Date:', 'Fecha:', o similar. Lee los números de ese campo y conviértelos a YYYY-MM-DD. Por ejemplo: si ves 'FECHA: 04/12/2024' → devuelve '2024-12-04'. Si ves 'FECHA: 12/04/2024' → devuelve '2024-04-12'. Si ves 'FECHA: 04/12/2024 HORA: 1:29:45' → ignora la hora y devuelve solo '2024-12-04'. NUNCA devuelvas la fecha de hoy (${today}) si el documento tiene una fecha impresa.

EJEMPLOS DE MAPEO:
- "Cristhian gastó 15 en el Súper 99 ayer": accion="gasto", parametros={pagador: "Cristhian", monto: 15, detalle: "Súper 99", categoria: "Supermercado", fecha: ayer}
- "Cobré 50 por una asesoría": accion="ingreso", parametros={monto: 50, detalle: "Asesoría", pagador: "Cristhian" (si no se especifica)}
- "El Yaris llegó a 209500 km hoy": accion="kilometraje", parametros={vehiculo: "Yaris", km_lectura: 209500, fecha: hoy}
- "Cambiar pastillas del Tucson, cuesta 80": accion="pendiente_auto" (o mantenimiento_auto si ya se hizo), parametros={vehiculo: "Tucson", mantenimiento_tipo: "Cambiar pastillas", costo_estimado: 80}
- "Limpieza de aire en la sala urgente por 40 dolares": accion="trabajo_hogar", parametros={hogar_area: "Sala", detalle: "Limpieza de aire", hogar_prioridad: "Urgente", costo_estimado: 40}
- "Pagué el internet de Tigo hoy por 45": accion="pago_fijo", parametros={obligacion: "Tigo Internet", monto: 45, fecha: hoy}
- "Aboné 20 dolares al ahorro navideño": accion="meta_ahorro", parametros={obligacion: "Ahorro Navideño", monto: 20, fecha: hoy}
- "Hola, ¿cómo estás?": accion="desconocido", parametros={}

Texto del usuario: "${text || 'Aquí está el archivo adjunto'}"`;

    const contentsParams: any[] = [prompt];
    
    if (base64Data && mimeType) {
      contentsParams.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: contentsParams,
      config: {
        systemInstruction: `Eres un asistente experto en extraer datos de facturas y recibos panameños.
        REGLA CRÍTICA SOBRE FECHAS: Cuando analices una imagen o PDF de factura/recibo, DEBES leer la fecha impresa en el documento (campos como 'FECHA:', 'Date:', 'Fecha de emisión:', etc.) y convertirla a formato YYYY-MM-DD.
        El formato de fecha en Panamá es DD/MM/YYYY, es decir 'FECHA: 04/12/2024' significa el 4 de diciembre de 2024, que se escribe como 2024-12-04.
        NUNCA devuelvas la fecha actual del sistema si el documento tiene una fecha visible. La fecha del documento SIEMPRE tiene prioridad absoluta.
        Si ves 'FECHA: 04/12/2024 HORA: 1:29:45' → extrae solo '2024-12-04', ignora la hora.`,
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
