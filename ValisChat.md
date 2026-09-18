Rol: Eres un Arquitecto de Software Senior y experto en Next.js (App Router), Supabase (PostgreSQL) y el Vercel AI SDK (o API nativa de Google Gemini).

Contexto del Proyecto:
Estoy desarrollando "ValisChat", un CRM de ventas y atención al cliente automatizado que funciona a través de WhatsApp Business. La aplicación está alojada en Vercel. Ya tengo configurado un webhook básico que recibe los mensajes de WhatsApp.

Objetivo:
Quiero implementar un "Agente Inteligente" utilizando Google Gemini Flash. En lugar de crear un flujo visual de nodos estático, quiero utilizar la arquitectura de "Function Calling" (Llamada a Herramientas). El Agente debe ser capaz de decidir dinámicamente qué herramienta ejecutar según la intención del cliente.

Requerimientos Técnicos y Arquitectura a programar:

1. Gestión de Memoria y Optimización de Tokens (Supabase):
Necesito la lógica para consultar y guardar el historial de chat en una tabla de Supabase, aplicando una doble estrategia para no desperdiciar tokens ni confundir a la IA:
- Regla de Inactividad (24h): Si el último mensaje de ese número de WhatsApp fue hace más de 24 horas, el historial se ignora y la IA comienza una conversación en blanco (nueva sesión).
- Ventana Deslizante (Sliding Window): Si es una sesión activa, la consulta a Supabase debe extraer estrictamente solo los últimos 10 mensajes intercambiados para enviarlos como contexto.

2. Herramientas del Agente (Function Calling):
Quiero que me estructures el código definiendo al menos las siguientes "Tools" para que Gemini las utilice:
- tool_buscar_pdf_rag: Una función simulada que recibe una consulta del cliente y busca en una base de datos vectorial (como pgvector en Supabase) para extraer contexto de manuales y responder dudas.
- tool_agendar_calendar: Una función que se activa si el cliente quiere una cita, estructurando los parámetros necesarios para la API de Google Calendar.
- tool_enviar_email: Una función para notificar a mi equipo comercial vía Gmail cuando un cliente esté listo para cerrar una compra.

3. Flujo del Webhook (Next.js API Route):
Escribe el código principal del webhook (/api/whatsapp) donde:
- Se recibe el payload de WhatsApp.
- Se ejecuta la función de memoria de Supabase (con los límites de 24h y 10 mensajes).
- Se llama al modelo de Gemini pasándole el historial y las herramientas.
- Si Gemini decide usar una herramienta, se ejecuta y se le devuelve el resultado.
- Se envía la respuesta de texto final de vuelta a la API de WhatsApp.

Por favor, entrégame la estructura del código en TypeScript, separando claramente la lógica de la base de datos (Supabase), la definición de las herramientas y el controlador del webhook principal.