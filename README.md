# ValisFin

ValisFin es un ecosistema financiero integral diseñado para la gestión y administración de finanzas empresariales y familiares. La aplicación está dividida en múltiples submódulos especializados, apoyados por inteligencia artificial para agilizar la entrada de datos y el análisis.

## 🚀 Tecnologías Principales (Tech Stack)

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Lenguaje**: TypeScript
- **Estilos y UI**: Tailwind CSS, Lucide Icons (diseño oscuro/glassmorphism premium)
- **Base de Datos & Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Edge Functions)
- **Inteligencia Artificial**: Google Gemini 3.5 Flash Lite (procesamiento de imágenes, OCR para facturas/reportes y NLP)
- **Despliegue**: Vercel (Frontend) y Supabase (Backend)

## 🧩 Submódulos del Sistema

1. **ValisBiz (CRM y Control de Ventas)**
   - Gestión de locales (puntos de venta), vendedores y visitas.
   - **ValisAI (Asistente Flotante)**: Chatbot integrado capaz de leer fotografías de reportes de ventas (Excel/Keiko) y facturas de clientes, comprimir imágenes HEIC de iOS al vuelo, extraer montos y autocompletar formularios.

2. **ValisVen (Control de Vehículos y Flota)**
   - Seguimiento de mantenimientos vehiculares, cambios de aceite y reparaciones.

3. **Gastos Diarios y Pagos Fijos**
   - Control de presupuestos, gastos hormiga y visualización de tarjetas de crédito.

4. **ValisAN (Análisis y Reportes Avanzados)**
   - Dashboard analítico general del estado de las finanzas y reportes mensuales automatizados.

## ⚙️ Estructura del Proyecto

- `/app`: Rutas de Next.js (App Router) y componentes de UI segmentados por submódulo.
- `/lib/supabase`: Clientes de conexión e interacción con Supabase (Browser y Server).
- `/app/valisbiz/acciones`: Server Actions (acciones de servidor) para validación y peticiones seguras a BD y Gemini.
