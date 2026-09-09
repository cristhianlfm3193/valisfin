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

══════════════════════════════════════════
VOCABULARIO WHATSAPP DEL EQUIPO KEIKO
══════════════════════════════════════════
Los vendedores envían mensajes de WhatsApp en lenguaje natural. Debes mapear el vocabulario así:

VISITAS (campo: vistas):
  "clientes visitados", "visitas", "locales visitados", "clientes del día", "visitas del día" → vistas

CON COMPRA (campo: con_compra):
  "clientes efectivos", "efectivos", "con compra", "compraron", "clientes que compraron" → con_compra

SIN COMPRA (campo: sin_compra):
  "sin compra", "no compraron", "clientes sin efectividad" → sin_compra
  ⚠️ Si NO mencionan sin_compra pero SÍ dan vistas y con_compra: calcula sin_compra = vistas - con_compra

MONTOS (campos: contado, credito):
  REGLA PRINCIPAL: Si el mensaje NO menciona "crédito" ni "a crédito", TODO el valor va a CONTADO.
  - "valor recaudado", "total recaudado", "vendido", "recaudé", "recaudado" sin especificar → contado
  - "al contado", "en efectivo", "contado" → contado
  - "a crédito", "crédito", "en crédito", "en credito" → credito
  - Si menciona AMBOS (contado y crédito) → separa los valores correctamente
  - El campo "total" en el sistema = contado + crédito

FECHA:
  - Si no menciona fecha → usa hoy (${today})
  - "hoy" → ${today}
  - "ayer" → día anterior

VENDEDOR:
  - Si el mensaje no identifica al vendedor, deja vendedor_nombre vacío y el usuario lo seleccionará

══════════════════════════════════════════
EJEMPLOS REALES DEL EQUIPO
══════════════════════════════════════════
Ejemplo 1 (típico mensaje WhatsApp):
  "Clientes visitados 12
   Clientes efectivos 7
   Valor recaudado 588.28"
→ tipo='vendido', vistas=12, con_compra=7, sin_compra=5 (12-7), contado=588.28, credito=0

Ejemplo 2 (con crédito explícito):
  "Andrés: 10 visitas, 6 efectivos, 400 contado, 150 crédito"
→ tipo='vendido', vendedor='Andrés', vistas=10, con_compra=6, sin_compra=4, contado=400, credito=150

Ejemplo 3 (imagen Excel Keiko con columnas):
  Andres Chavez    | 12 | 9 | 3 | 1877.61 | 2162.05 | 4039.66
  Joseph Dominguez | 12 | 7 | 5 | 686.46  |         | 686.46
  Enrique del Rosario | 0 | 0 | 0 | 0.00 |         | 0.00
→ 3 registros tipo='vendido', uno por vendedor.

REGLAS ADICIONALES:
1. Si ves una tabla con VARIOS vendedores → extrae UN registro por cada vendedor visible, devuélvelos TODOS.
2. Si un vendedor tiene todos los valores en 0, inclúyelo igual.
3. Lee la fecha impresa si existe (formato DD/MM/YYYY en Panamá → YYYY-MM-DD).
4. Si hay una sola línea de monto sin actividad de campo → tipo='facturado'.

Analiza ahora: "${texto || 'Imagen adjunta, extrae todos los vendedores visibles.'}"`


    const contenido: any[] = [prompt];
    if (base64Data && mimeType) {
      contenido.push({ inlineData: { data: base64Data, mimeType } });
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('La IA tardó demasiado (30s). Intenta de nuevo.')), 30000)
    );

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: contenido,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        }
      }),
      timeoutPromise,
    ]);

    if (!response.text) return { success: false, error: 'La IA no devolvió respuesta' };

    const parsed: ResultadoIAValisBiz = JSON.parse(response.text);
    return { success: true, data: parsed };

  } catch (err: any) {
    console.error('[ValisBiz IA]', err);
    return { success: false, error: err.message || 'Error en la IA' };
  }
}
