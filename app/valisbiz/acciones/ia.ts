'use server';

import { GoogleGenAI, Type, Schema } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

export interface DatosIAVendedor {
  tipo: 'facturado' | 'vendido' | 'desconocido';
  vendedor_nombre?: string;
  fecha?: string;             // YYYY-MM-DD
  // Facturado
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
  resumen: string;
}

// ── Parser local de mensajes WhatsApp (sin IA, instantáneo) ──────────────────
const VENDEDORES_CONOCIDOS = [
  { nombre: 'Andrés Chávez', aliases: ['andres', 'andrés', 'chavez', 'chávez'] },
  { nombre: 'Joseph Domínguez', aliases: ['joseph', 'josep', 'dominguez', 'domínguez'] },
  { nombre: 'Enrique del Rosario', aliases: ['enrique', 'del rosario', 'rosario'] },
  { nombre: 'Carolina Sucre', aliases: ['carolina', 'sucre', 'caro'] },
];

function num(s: string | undefined): number {
  if (!s) return 0;
  let v = s.trim();
  // Caso: tiene coma Y punto → coma=miles, punto=decimal  (1,116.50 → 1116.50)
  if (v.includes(',') && v.includes('.')) {
    v = v.replace(/,/g, '');
  }
  // Caso: solo coma seguida de exactamente 3 dígitos → miles  (1,116 → 1116)
  else if (/,\d{3}$/.test(v) || /^\d{1,3}(,\d{3})+$/.test(v)) {
    v = v.replace(/,/g, '');
  }
  // Caso: coma con 1-2 dígitos al final → decimal  (135,18 → 135.18)
  else if (/,\d{1,2}$/.test(v)) {
    v = v.replace(',', '.');
  }
  return parseFloat(v) || 0;
}

function detectarFecha(texto: string, today: string): string {
  if (/\bayer\b/i.test(texto)) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  // Fecha en español: "1 de septiembre 2026", "01 de sept 2026", "15 de enero"
  const MESES: Record<string, string> = {
    enero:'01', febrero:'02', marzo:'03', abril:'04', mayo:'05', junio:'06',
    julio:'07', agosto:'08', septiembre:'09', sept:'09', sep:'09',
    octubre:'10', oct:'10', noviembre:'11', nov:'11', diciembre:'12', dic:'12',
  };
  const espMatch = texto.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\.?(?:\s+(\d{4}))?/i);
  if (espMatch) {
    const mes = MESES[espMatch[2].toLowerCase()];
    if (mes) {
      const anio = espMatch[3] || today.split('-')[0];
      return `${anio}-${mes}-${espMatch[1].padStart(2,'0')}`;
    }
  }

  // Fecha DD/MM/YYYY
  const m = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  // Fecha YYYY-MM-DD
  const iso = texto.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];

  return today;
}

function detectarVendedor(texto: string): string | undefined {
  const t = texto.toLowerCase();
  for (const v of VENDEDORES_CONOCIDOS) {
    if (v.aliases.some(a => t.includes(a))) return v.nombre;
  }
  return undefined;
}

function parsearTextoWhatsApp(texto: string, today: string): ResultadoIAValisBiz | null {
  const t = texto.toLowerCase();

  // Patrones de visitas / clientes visitados
  const visitasMatch = texto.match(
    /(?:clientes?\s+(?:visitados?|atendidos?|del\s+d[ií]a)|visitas?(?:\s+del\s+d[ií]a)?|locales?\s+visitados?|recorridos?|clientes?\s+recorridos?)\s*[:\-.]?\s*(\d+)/i
  );

  // Patrones de con compra / efectivos (todos los sinónimos del equipo)
  const efectivosMatch = texto.match(
    /(?:clientes?\s+(?:efectivos?|con\s+p(?:e|e)didos?|con\s+compra?|facturados?|cerrados?)|efectivos?|con\s+p(?:e|e)didos?|con\s+compra|compraron|ventas?\s+cerradas?|p(?:e|e)didos?\s+tomados?)\s*[:\-.]?\s*(\d+)/i
  );

  // Sin compra explícito
  const sinCompraMatch = texto.match(/(?:sin\s+compra|no\s+compraron|sin\s+p(?:e|e)didos?|clientes?\s+sin\s+(?:compra|pedido))\s*[:\-.]?\s*(\d+)/i);

  // Contado
  const contadoMatch = texto.match(/(?:al?\s+contado|en\s+efectivo|contado)\s*[:\-.]?\s*(\d[\d,\.]*)/i);
  // Crédito
  const creditoMatch = texto.match(/(?:a?\s*cr[eé]dito|en\s+cr[eé]dito)\s*[:\-.]?\s*(\d[\d,\.]*)/i);
  // Valor recaudado / total
  const recaudadoMatch = texto.match(/(?:valor\s+recaudado|total\s+recaudado|recaud[eé]|recaudado|vendido\s+hoy|total\s+del\s+d[ií]a|monto\s+total|valor\s+cobrado|cobrado)\s*[:\-.]?\s*(\d[\d,\.]*)/i);


  const tieneVentas = visitasMatch || efectivosMatch || contadoMatch || creditoMatch || recaudadoMatch;

  // Si no hay ningún dato reconocible, no parsear localmente → dejar a Gemini
  if (!tieneVentas) return null;

  const vistas = visitasMatch ? parseInt(visitasMatch[1]) : undefined;
  const con_compra = efectivosMatch ? parseInt(efectivosMatch[1]) : undefined;
  const sin_compra_explicito = sinCompraMatch ? parseInt(sinCompraMatch[1]) : undefined;
  const sin_compra = sin_compra_explicito ?? (vistas !== undefined && con_compra !== undefined ? Math.max(0, vistas - con_compra) : undefined);

  // Lógica de montos: si no dice crédito → todo es contado
  let contado = contadoMatch ? num(contadoMatch[1]) : 0;
  const credito = creditoMatch ? num(creditoMatch[1]) : 0;
  if (!contadoMatch && recaudadoMatch && !creditoMatch) {
    // "valor recaudado X" sin especificar → todo contado
    contado = num(recaudadoMatch[1]);
  } else if (!contadoMatch && recaudadoMatch && creditoMatch) {
    // Recaudado total con crédito mencionado → contado = total - crédito
    contado = Math.max(0, num(recaudadoMatch[1]) - credito);
  }

  const vendedor_nombre = detectarVendedor(texto);
  const fecha = detectarFecha(texto, today);

  const registro: DatosIAVendedor = {
    tipo: 'vendido',
    vendedor_nombre,
    fecha,
    vistas,
    con_compra,
    sin_compra,
    contado,
    credito,
  };

  const partes: string[] = [];
  if (vendedor_nombre) partes.push(vendedor_nombre);
  if (vistas !== undefined) partes.push(`${vistas} vistas`);
  if (con_compra !== undefined) partes.push(`${con_compra} con compra`);
  if (sin_compra !== undefined) partes.push(`${sin_compra} sin compra`);
  if (contado) partes.push(`B/.${contado.toFixed(2)} contado`);
  if (credito) partes.push(`B/.${credito.toFixed(2)} crédito`);

  return {
    registros: [registro],
    resumen: `✅ Parseado al instante: ${partes.join(' · ')}`,
  };
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

    const today = new Date().toISOString().split('T')[0];

    // ══════════════════════════════════════════════════════════════════
    // PARSER LOCAL — procesa texto simple sin llamar a Gemini (~0ms)
    // Solo se activa cuando NO hay imagen adjunta
    // ══════════════════════════════════════════════════════════════════
    if (!base64Data && texto.trim()) {
      const local = parsearTextoWhatsApp(texto, today);
      if (local) return { success: true, data: local };
    }

    // ── Si hay imagen o el texto no es reconocible → usa Gemini ──────
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
- FACTURADO (Finanzas): facturación oficial de Excel. Campos: vendedor, fecha, contado (B/.), crédito (B/.), notas.
- VENDIDO (Vendedor): reporte diario de campo. Campos: vendedor, fecha, vistas (locales visitados), con_compra (compraron), sin_compra (no compraron), contado (B/.), crédito (B/.).
- Vendedores del equipo: Andrés Chávez, Joseph Domínguez, Enrique del Rosario.

MAPEO DE NOMBRES EN EXCEL DE FINANZAS:
Si estás leyendo el Excel de finanzas, mapea las columnas así:
- "CAROLINA SUCRE" o "Carolina Sucre - Vend. Mercaderista" → "Joseph Domínguez"
- "ENRIQUE DEL ROSARIO" → "Enrique del Rosario"
- "ANDRES CHAVEZ" o "Andres Chavez - Vend. Pre-Venta" → "Andrés Chávez"

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
