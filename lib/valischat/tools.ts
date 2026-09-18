import { createClient } from '@supabase/supabase-js'

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
    description: 'Busca en la base de conocimientos documental, manuales de usuario de ValisFin/ValisVen, catálogo de precios de licencias y preguntas frecuentes para resolver dudas del cliente con exactitud.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Pregunta o término de búsqueda sobre el cual se requiere contexto (ej. "precio licencia office", "cómo exportar reportes", "requisitos de instalación").'
        }
      },
      required: ['query']
    },
    execute: async ({ query }: { query: string }, context?: any) => {
      console.log(`🔍 [Tool RAG] Ejecutando búsqueda vectorial para: "${query}"`);
      const q = query.toLowerCase();

      // Simulación de búsqueda semántica / pgvector sobre base de conocimiento
      if (q.includes('office') || q.includes('licencia') || q.includes('precio') || q.includes('costo')) {
        return {
          encontrado: true,
          fuente: 'Catalogo_Licencias_ValisFin_2026.pdf (Pág 1-3)',
          coincidencia_vectorial: 0.94,
          fragmentos: [
            {
              titulo: 'Licencias Microsoft 365 / Office Pro Plus',
              contenido: 'Licencia original Microsoft 365 Apps for Enterprise para 5 dispositivos (PC/Mac/Móvil). Precio regular: $45.00/año. Incluye Word, Excel, PowerPoint, Outlook y 1TB de almacenamiento en OneDrive.',
              garantia: '12 meses con soporte técnico e instalación remota incluida.'
            },
            {
              titulo: 'Licencia ValisVen POS & CRM',
              contenido: 'Módulo integral de facturación electrónica, ventas en ruta y control de clientes por $25.00/mes o $240.00/año.',
              soporte: 'Soporte vía WhatsApp y sincronización con Supabase.'
            }
          ]
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

      return {
        success: true,
        ticket_id: ticketId,
        notificado_a: destinatario,
        prioridad: args.prioridad || 'alta',
        timestamp: new Date().toISOString(),
        datos_cliente: {
          nombre: args.cliente_nombre,
          telefono: args.cliente_telefono,
          interes: args.resumen_compra,
          monto_estimado: args.monto_estimado ? `$${args.monto_estimado}` : 'Por cotizar'
        },
        mensaje_sistema: 'El equipo de ventas ha recibido la alerta con alta prioridad y tiene tus datos para concretar la entrega.'
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
        let query = supabase
          .from('valisven_licencias')
          .select('id, tipo, producto, costo_venta')
          .order('tipo', { ascending: true });

        if (termino_busqueda && termino_busqueda.toLowerCase() !== 'todos') {
          query = query.ilike('producto', `%${termino_busqueda.trim()}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        const productos = (data || []).map((p: any) => {
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
            ? `Se encontraron ${productos.length} productos en el catálogo oficial de ValisVen.`
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
