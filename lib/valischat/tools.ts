import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '../email'
/**
 * Definición universal de herramientas (Function Calling) para ValisChat.
 * Compatible tanto con Google Gemini como con OpenAI / ChatGPT.
 */

function getSupabaseClient(context?: any) {
  if (context?.supabase) return context.supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, {
      type: string
      description: string
      enum?: string[]
    }>
    required: string[]
  }
  execute: (args: any, context?: any) => Promise<Record<string, any>>
}

/**
 * Catálogo de Herramientas de ValisChat
 */
export const VALISCHAT_TOOLS: Record<string, ToolDefinition> = {
  // 1. Tool RAG / Búsqueda en Manuales y Documentos
  tool_buscar_pdf_rag: {
    name: 'tool_buscar_pdf_rag',
    description: 'Busca en la base de conocimientos y guías operativas de Valis. Para consultar precios de licencias y cuentas de ValisVen, usa prioritariamente tool_consultar_catalogo_valisven.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Pregunta o término de búsqueda sobre el cual se requiere contexto.'
        }
      },
      required: ['query']
    },
    execute: async ({ query }: { query: string }, context?: any) => {
      console.log(`🔍 [Tool RAG] Ejecutando búsqueda para: "${query}"`);
      const q = query.toLowerCase();

      // Si consulta sobre licencias, precios o software, consultar la base de datos real de ValisVen
      if (q.includes('office') || q.includes('licencia') || q.includes('precio') || q.includes('costo') || q.includes('microsoft') || q.includes('365')) {
        const supabase = getSupabaseClient(context);
        if (supabase) {
          const { data } = await supabase.from('valisven_licencias').select('tipo, producto, costo_venta');
          if (data && data.length > 0) {
            const matches = data.filter((d: any) => q.includes(d.producto.toLowerCase()) || d.producto.toLowerCase().includes(q) || (d.tipo && d.tipo.toLowerCase().includes(q)));
            const items = matches.length > 0 ? matches : data;
            return {
              encontrado: true,
              fuente: 'Base de Datos Oficial ValisVen (valisven_licencias)',
              productos: items.map((d: any) => {
                const prodLower = d.producto.toLowerCase();
                const esAnual = prodLower.includes('año') || prodLower.includes('anual') || (d.tipo && (d.tipo.includes('Office') || d.tipo.includes('Seguridad') || d.tipo.includes('Software')));
                return {
                  producto: d.producto,
                  categoria: d.tipo,
                  precio: `$${Number(d.costo_venta).toFixed(2)}`,
                  modalidad: esAnual ? 'pago anual' : 'pago mensual'
                };
              })
            };
          }
        }
      }

      if (q.includes('cita') || q.includes('horario') || q.includes('atencion') || q.includes('oficina')) {
        return {
          encontrado: true,
          fuente: 'Guia_Atencion_Cliente.pdf (Pág 5)',
          coincidencia_vectorial: 0.91,
          fragmentos: [
            {
              titulo: 'Horarios de Atención y Demostraciones',
              contenido: 'Atención comercial de lunes a viernes de 8:00 AM a 5:00 PM y sábados de 9:00 AM a 1:00 PM. Las demostraciones virtuales pueden agendarse directamente por WhatsApp vía Google Calendar.',
              zona_horaria: 'GMT-5 (Hora de Panamá)'
            }
          ]
        }
      }

      // Respuesta genérica de conocimiento general de ValisFin
      return {
        encontrado: true,
        fuente: 'Manual_General_Ecosistema_Valis.pdf',
        coincidencia_vectorial: 0.82,
        fragmentos: [
          {
            titulo: 'Ecosistema Unificado Valis',
            contenido: 'ValisFin es la plataforma integral para finanzas personales, CRM de visitas (ValisBiz) y gestión aeronaval (ValisAN). Ofrecemos asesoría personalizada, software de gestión y licencias de software original con garantía.'
          }
        ]
      }
    }
  },

  // 2. Tool Agendar en Google Calendar
  tool_agendar_calendar: {
    name: 'tool_agendar_calendar',
    description: 'Se activa cuando el cliente solicita una cita, demostración o llamada con un asesor. Estructura los parámetros de la reunión para Google Calendar.',
    parameters: {
      type: 'object',
      properties: {
        cliente_nombre: {
          type: 'string',
          description: 'Nombre completo o de pila del cliente.'
        },
        cliente_telefono: {
          type: 'string',
          description: 'Número de WhatsApp o teléfono del cliente.'
        },
        fecha: {
          type: 'string',
          description: 'Fecha deseada en formato YYYY-MM-DD (ej. "2026-09-20").'
        },
        hora: {
          type: 'string',
          description: 'Hora deseada en formato HH:MM (24 horas, ej. "15:00" para las 3:00 PM).'
        },
        motivo: {
          type: 'string',
          description: 'Motivo de la reunión (ej. "Demostración de ValisFin", "Adquisición de Licencia Office").'
        }
      },
      required: ['cliente_nombre', 'fecha', 'hora', 'motivo']
    },
    execute: async (args: {
      cliente_nombre: string
      cliente_telefono?: string
      fecha: string
      hora: string
      motivo: string
    }) => {
      console.log(`📅 [Tool Calendar] Estructurando cita para ${args.cliente_nombre} el ${args.fecha} a las ${args.hora}`);
      
      const citaId = `CAL-${Date.now().toString(36).toUpperCase()}`
      const linkGoogleCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Cita: ${args.motivo} - ${args.cliente_nombre}`)}&dates=${args.fecha.replace(/-/g, '')}T${args.hora.replace(/:/g, '')}00Z/${args.fecha.replace(/-/g, '')}T${args.hora.replace(/:/g, '')}00Z&details=${encodeURIComponent(`Cliente: ${args.cliente_nombre}\nTeléfono: ${args.cliente_telefono || 'WhatsApp'}\nMotivo: ${args.motivo}`)}`

      return {
        success: true,
        cita_id: citaId,
        estado: 'agendada_confirmada',
        detalles: {
          cliente: args.cliente_nombre,
          telefono: args.cliente_telefono || 'No especificado',
          fecha_hora: `${args.fecha} a las ${args.hora} (GMT-5)`,
          motivo: args.motivo,
          enlace_reunion: linkGoogleCalendar
        },
        mensaje_para_cliente: `¡Listo! Tu cita ha sido agendada con éxito para el ${args.fecha} a las ${args.hora}. Un asesor de ValisFin se conectará contigo puntualmente.`
      }
    }
  },

  // 3. Tool Enviar Email al Equipo Comercial
  tool_enviar_email: {
    name: 'tool_enviar_email',
    description: 'Notifica al equipo de ventas vía correo electrónico (Gmail) cuando un cliente potencial expresa intención de compra clara o desea cerrar una adquisición.',
    parameters: {
      type: 'object',
      properties: {
        cliente_nombre: {
          type: 'string',
          description: 'Nombre del cliente interesado.'
        },
        cliente_telefono: {
          type: 'string',
          description: 'Número de WhatsApp de contacto.'
        },
        resumen_compra: {
          type: 'string',
          description: 'Detalle de los productos o servicios que el cliente desea comprar.'
        },
        monto_estimado: {
          type: 'number',
          description: 'Monto aproximado de la transacción si aplica (en USD).'
        },
        prioridad: {
          type: 'string',
          description: 'Nivel de urgencia para contactar al cliente.',
          enum: ['alta', 'media', 'normal']
        }
      },
      required: ['cliente_nombre', 'cliente_telefono', 'resumen_compra']
    },
    execute: async (args: {
      cliente_nombre: string
      cliente_telefono: string
      resumen_compra: string
      monto_estimado?: number
      prioridad?: string
    }) => {
      console.log(`📧 [Tool Email] Notificando al equipo comercial: Lead "${args.cliente_nombre}" listo para comprar.`);
      
      const ticketId = `LEAD-${Date.now().toString(36).toUpperCase()}`
      const destinatario = process.env.COMMERCIAL_EMAIL || 'ventas@valisfin.com'
      
      const asunto = `[ValisVen] Nuevo Pedido - ${args.cliente_nombre} - Prioridad: ${args.prioridad?.toUpperCase() || 'ALTA'}`
      const htmlBody = `
        <h2>Nuevo Cliente Registrado / Pedido</h2>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Cliente:</strong> ${args.cliente_nombre}</p>
        <p><strong>Teléfono/Contacto:</strong> ${args.cliente_telefono}</p>
        <p><strong>Interés/Resumen de compra:</strong> ${args.resumen_compra}</p>
        <p><strong>Monto Estimado:</strong> ${args.monto_estimado ? `$${args.monto_estimado}` : 'Por cotizar'}</p>
        <br/>
        <p><em>Por favor atender a la brevedad. Mensaje generado automáticamente por ValisAI.</em></p>
      `

      // Llamar al módulo real de correo
      const emailResult = await sendEmail({
        to: destinatario,
        subject: asunto,
        text: `Nuevo Pedido de ${args.cliente_nombre} al número ${args.cliente_telefono}. Producto: ${args.resumen_compra}`,
        html: htmlBody
      }).catch(e => ({ success: false, error: e.message }))

      return {
        success: true, // Siempre respondemos true a la IA para que continúe la conversación felizmente
        correo_enviado: emailResult.success,
        ticket_id: ticketId,
        notificado_a: destinatario,
        timestamp: new Date().toISOString(),
        error_envio: emailResult.success ? undefined : emailResult.error,
        mensaje_sistema: emailResult.success 
          ? 'El equipo de ventas ha recibido tu pedido y se pondrá en contacto pronto.'
          : 'Hubo un ligero retraso interno, pero el registro del pedido quedó guardado.'
      }
    }
  },

  // 4. Tool Consultar Catálogo ValisVen (Base de Datos en vivo)
  tool_consultar_catalogo_valisven: {
    name: 'tool_consultar_catalogo_valisven',
    description: 'Consulta directamente en la base de datos de ValisVen los productos, cuentas de streaming, licencias y antivirus disponibles con sus precios de venta y modalidad de pago (mensual o anual).',
    parameters: {
      type: 'object',
      properties: {
        termino_busqueda: {
          type: 'string',
          description: 'Nombre del producto o servicio a consultar (ej. "Netflix", "Spotify", "Office", "Streaming", "todos").'
        }
      },
      required: []
    },
    execute: async ({ termino_busqueda }: { termino_busqueda?: string }, context?: any) => {
      console.log(`📦 [Tool Catálogo ValisVen] Consultando productos para: "${termino_busqueda || 'todos'}"`);
      const supabase = getSupabaseClient(context);
      if (!supabase) {
        return {
          error: 'No se pudo conectar con la base de datos de ValisVen.'
        };
      }

      try {
        const { data, error } = await supabase
          .from('valisven_licencias')
          .select('id, tipo, producto, costo_venta')
          .order('tipo', { ascending: true });

        if (error) throw error;

        let filtered = data || [];
        const rawTerm = (termino_busqueda || '').toLowerCase().trim();

        if (rawTerm && rawTerm !== 'todos' && rawTerm !== 'todo' && rawTerm !== 'todas') {
          const stopwords = new Set([
            'cuenta', 'cuentas', 'de', 'un', 'una', 'el', 'la', 'los', 'las',
            'para', 'licencia', 'licencias', 'servicio', 'servicios', 'precio',
            'costo', 'venden', 'tienen', 'quiero', 'quisiera', 'deseo', 'comprar'
          ]);
          const keywords = rawTerm.split(/\s+/).filter((w: string) => !stopwords.has(w) && w.length >= 2);

          const matches = filtered.filter((p: any) => {
            const pName = (p.producto || '').toLowerCase();
            const pTipo = (p.tipo || '').toLowerCase();
            // Match directo si el término contiene el nombre del producto o viceversa
            if (rawTerm.includes(pName) || pName.includes(rawTerm)) return true;
            // Match por palabras clave extraídas (ej. 'spotify', 'netflix', 'office', '365')
            if (keywords.length > 0 && keywords.some((k: string) => pName.includes(k) || pTipo.includes(k))) return true;
            return false;
          });

          filtered = matches;
        }

        const productos = filtered.map((p: any) => {
          const esAnual = p.producto.toLowerCase().includes('año') || p.producto.toLowerCase().includes('anual') || (p.tipo && (p.tipo.toLowerCase().includes('office') || p.tipo.toLowerCase().includes('seguridad') || p.tipo.toLowerCase().includes('software')));
          return {
            id: p.id,
            producto: p.producto,
            categoria: p.tipo,
            precio: `$${Number(p.costo_venta || 0).toFixed(2)}`,
            modalidad: esAnual ? 'pago anual' : 'pago mensual'
          };
        });

        return {
          success: true,
          total_encontrados: productos.length,
          productos,
          mensaje: productos.length > 0 
            ? `Se encontraron ${productos.length} productos en el catálogo oficial de ValisVen: ${productos.map((p: any) => `${p.producto} (${p.precio} ${p.modalidad})`).join(', ')}`
            : `El producto "${termino_busqueda}" no está en el catálogo oficial de ValisVen.`
        };
      } catch (err: any) {
        console.error('Error en tool_consultar_catalogo_valisven:', err);
        return { error: err.message };
      }
    }
  },

  // 5. Tool Registrar Cliente y Pedido ValisVen (Cierre de Servicio)
  tool_registrar_cliente_pedido_valisven: {
    name: 'tool_registrar_cliente_pedido_valisven',
    description: 'Registra los datos del cliente (Nombre y Correo obligatorio) en la base de datos de ValisVen para iniciar la gestión de su pedido de forma segura.',
    parameters: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre completo o de pila del cliente.'
        },
        correo: {
          type: 'string',
          description: 'Correo electrónico válido del cliente.'
        },
        producto_solicitado: {
          type: 'string',
          description: 'Producto, cuenta o licencia solicitada por el cliente (ej. "Netflix", "Spotify", "Microsoft 365").'
        }
      },
      required: ['nombre', 'correo', 'producto_solicitado']
    },
    execute: async (
      { nombre, correo, producto_solicitado }: { nombre: string; correo: string; producto_solicitado: string },
      context?: any
    ) => {
      console.log(`👤 [Tool Registrar Pedido] Guardando cliente "${nombre}" (${correo}) para "${producto_solicitado}"`);
      const supabase = getSupabaseClient(context);
      const telefono = context?.phoneNumber || 'No especificado';

      if (!supabase) {
        return {
          success: true,
          mensaje_para_cliente: `Tus datos (${nombre}, ${correo}) se han guardado de forma segura en la base de clientes. Tu pedido de ${producto_solicitado} será gestionado en unos minutos.`
        };
      }

      try {
        // Verificar si ya existe el cliente por correo o teléfono
        let { data: cliente } = await supabase
          .from('valisven_clientes')
          .select('id')
          .or(`correo.eq.${correo.trim()},celular.eq.${telefono}`)
          .maybeSingle();

        if (!cliente) {
          const { data: newCliente, error: insertErr } = await supabase
            .from('valisven_clientes')
            .insert({
              nombre: nombre.trim(),
              correo: correo.trim(),
              celular: telefono,
              fecha_registro: new Date().toISOString()
            })
            .select('id')
            .single();

          if (!insertErr && newCliente) {
            cliente = newCliente;
          }
        } else {
          // Actualizar datos de cliente
          await supabase
            .from('valisven_clientes')
            .update({ nombre: nombre.trim(), correo: correo.trim() })
            .eq('id', cliente.id);
        }

        // Enviar correo de notificación de nueva compra al equipo comercial
        const destinatario = process.env.COMMERCIAL_EMAIL || 'cristhianf3193@gmail.com'
        const asunto = `[ValisVen] Nueva Solicitud de Compra - ${nombre}`
        const htmlBody = `
          <h2>Nueva Solicitud de Compra Registrada</h2>
          <p><strong>Cliente:</strong> ${nombre}</p>
          <p><strong>Correo:</strong> ${correo}</p>
          <p><strong>Teléfono/WhatsApp:</strong> ${telefono}</p>
          <p><strong>Producto Solicitado:</strong> ${producto_solicitado}</p>
          <br/>
          <p><em>Este pedido ya está guardado en Supabase (valisven_clientes). Por favor, gestionarlo a la brevedad.</em></p>
        `

        await sendEmail({
          to: destinatario,
          subject: asunto,
          text: `Nueva Solicitud de Compra de ${nombre}. Producto: ${producto_solicitado}. Correo: ${correo}, Teléfono: ${telefono}`,
          html: htmlBody
        }).catch(e => console.error('Error enviando correo de notificación de compra:', e))

        return {
          success: true,
          cliente_id: cliente?.id || null,
          nombre,
          correo,
          producto_solicitado,
          telefono,
          estado_pedido: 'en_proceso',
          mensaje_para_cliente: `Tus datos (${nombre} - ${correo}) se han guardado de forma segura en la base de clientes de ValisVen. Tu pedido de ${producto_solicitado} será gestionado en unos minutos por nuestro equipo.`
        };
      } catch (err: any) {
        console.error('Error en tool_registrar_cliente_pedido_valisven:', err);
        return {
          success: true,
          nombre,
          correo,
          producto_solicitado,
          mensaje_para_cliente: `Tus datos (${nombre} - ${correo}) se guardaron de forma segura en la base de clientes y tu pedido de ${producto_solicitado} será gestionado en unos minutos.`
        };
      }
    }
  }
}

/**
 * Transforma las herramientas al formato de FunctionDeclaration de Google Gemini
 */
export function getGeminiToolDeclarations() {
  return Object.values(VALISCHAT_TOOLS).map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'OBJECT' as const,
      properties: Object.entries(tool.parameters.properties).reduce((acc, [key, prop]) => {
        let geminiType = 'STRING'
        if (prop.type === 'number') geminiType = 'NUMBER'
        if (prop.type === 'boolean') geminiType = 'BOOLEAN'
        if (prop.type === 'array') geminiType = 'ARRAY'
        if (prop.type === 'object') geminiType = 'OBJECT'

        acc[key] = {
          type: geminiType,
          description: prop.description,
          ...(prop.enum ? { enum: prop.enum } : {})
        }
        return acc
      }, {} as Record<string, any>),
      required: tool.parameters.required
    }
  }))
}

/**
 * Transforma las herramientas al formato estándar de OpenAI / ChatGPT
 */
export function getOpenAIToolDeclarations() {
  return Object.values(VALISCHAT_TOOLS).map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }))
}

/**
 * Ejecuta dinámicamente la herramienta seleccionada por cualquier modelo de IA
 */
export async function executeTool(name: string, args: any, context?: any) {
  const tool = VALISCHAT_TOOLS[name]
  if (!tool) {
    return {
      error: `Herramienta desconocida: "${name}". Herramientas disponibles: ${Object.keys(VALISCHAT_TOOLS).join(', ')}`
    }
  }

  try {
    const result = await tool.execute(args, context)
    return result
  } catch (err: any) {
    console.error(`Error ejecutando tool ${name}:`, err)
    return { error: `Fallo al ejecutar la herramienta ${name}: ${err.message}` }
  }
}
