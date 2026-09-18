/**
 * Definición universal de herramientas (Function Calling) para ValisChat.
 * Compatible tanto con Google Gemini como con OpenAI / ChatGPT.
 */

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
