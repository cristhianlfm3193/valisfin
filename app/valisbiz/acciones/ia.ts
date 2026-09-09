'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

export interface DatosIAVendedor {
  tipo: 'facturado' | 'vendido' | 'desconocido';
  vendedor_nombre?: string;
  fecha?: string;             // YYYY-MM-DD
  // Facturado
  monto_facturado?: number;
  notas?: string;
  // Vendido
  vistas?: number;
  con_compra?: number;
  sin_compra?: number;
  contado?: number;
  credito?: number;
}

export interface ResultadoIAValisBiz {
  registros: DatosIAVendedor[];
  resumen: string;  // Ej: "Encontré datos de 3 vendedores en la imagen"
}

export async function analizarReporteValisBiz(
  texto: string,
  base64Data?: string,
  mimeType?: string
): Promise<{ success: boolean; data?: ResultadoIAValisBiz; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autorizado' };

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const today = new Date().toISOString().split('T')[0];

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        registros: {
          type: Type.ARRAY,
          description: "Lista de registros encontrados. Si hay múltiples vendedores, devuelve uno por cada uno.",
          items: {
            type: Type.OBJECT,
            properties: {
              tipo: {
                type: Type.STRING,
                enum: ['facturado', 'vendido', 'desconocido'],
                description: "'facturado' para registros de Finanzas. 'vendido' para reportes diarios de vendedor."
              },
              vendedor_nombre: {
                type: Type.STRING,
                description: "Nombre completo o parcial del vendedor tal como aparece."
              },
              fecha: {
                type: Type.STRING,
                description: `Fecha YYYY-MM-DD. Si hay fecha en la imagen úsala. 'hoy'=${today}.`
              },
              monto_facturado: { type: Type.NUMBER, description: "Monto facturado. Solo para tipo='facturado'." },
              notas: { type: Type.STRING, description: "Observaciones del registro." },
              vistas: { type: Type.NUMBER, description: "Locales visitados." },
              con_compra: { type: Type.NUMBER, description: "Locales que compraron." },
              sin_compra: { type: Type.NUMBER, description: "Locales que no compraron." },
              contado: { type: Type.NUMBER, description: "Monto al contado en B/." },
              credito: { type: Type.NUMBER, description: "Monto a crédito en B/." },
            },
            required: ['tipo']
          }
        },
        resumen: {
          type: Type.STRING,
          description: "Mensaje amigable resumiendo qué encontraste. Ej: 'Encontré 3 vendedores en la imagen con sus datos del día.'"
        }
      },
      required: ['registros', 'resumen']
    };

    const prompt = `Eres el asistente de IA de ValisBiz, sistema de supervisión de ventas de Keiko (distribución en Panamá Oeste).
La fecha de hoy es: ${today}.

CONTEXTO DEL SISTEMA:
- FACTURADO (Finanzas): facturación oficial. Campos: vendedor, fecha, monto total, notas.
- VENDIDO (Vendedor): reporte diario de campo. Campos: vendedor, fecha, vistas (locales visitados), con_compra (compraron), sin_compra (no compraron), contado (B/.), crédito (B/.).
- Vendedores del equipo: Andrés Chávez, Joseph Domínguez, Enrique del Rosario.

REGLAS CRÍTICAS:
1. Si ves una tabla o imagen con VARIOS vendedores (puede ser el Excel tipo Keiko con filas por vendedor), extrae UN registro por cada vendedor visible. Devuelve TODOS en el arreglo 'registros'.
2. Si la tabla tiene columnas: vistas / con compra / sin compra / contado / credito / total → tipo='vendido'.
3. Si hay una sola línea o monto sin actividad de campo → tipo='facturado'.
4. Lee la fecha impresa en la imagen si existe (formato DD/MM/YYYY en Panamá → conviértela a YYYY-MM-DD).
5. Si un vendedor tiene todos los valores en 0 (ej: Enrique: 0, 0, 0, 0.00, 0.00) igualmente inclúyelo.
6. NO omitas ningún vendedor que veas en la imagen aunque sus datos sean 0.

EJEMPLO DE IMAGEN KEIKO:
Si ves una tabla con:
  Andres Chavez    | 12 | 9 | 3 | 1877.61 | 2162.05 | 4039.66
  Joseph Dominguez | 12 | 7 | 5 | 686.46  |         | 686.46
  Enrique del Rosario | 0 | 0 | 0 | 0.00 |         | 0.00
→ Devuelves 3 registros tipo='vendido', uno por vendedor.

Analiza ahora: "${texto || 'Imagen adjunta, extrae todos los vendedores visibles.'}"`

    const contenido: any[] = [prompt];
    if (base64Data && mimeType) {
      contenido.push({ inlineData: { data: base64Data, mimeType } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: contenido,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    if (!response.text) return { success: false, error: 'La IA no devolvió respuesta' };

    const parsed: ResultadoIAValisBiz = JSON.parse(response.text);
    return { success: true, data: parsed };

  } catch (err: any) {
    console.error('[ValisBiz IA]', err);
    return { success: false, error: err.message || 'Error en la IA' };
  }
}
