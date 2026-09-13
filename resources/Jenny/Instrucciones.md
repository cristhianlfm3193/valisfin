# Instrucciones de Desarrollo: ValisBiz (App de Supervisión Keiko)

## 1. Contexto del Proyecto y Stack Tecnológico
Actúa como un Desarrollador Full-Stack y Arquitecto de Software experto. Tu objetivo es desarrollar el backend y consolidar el frontend de **ValisBiz**, un panel operativo y de inteligencia de campo diseñado para una Supervisora de Ventas (Jennifer Camaño) de Productos Keiko. 

El stack tecnológico estricto a utilizar es:
- **Framework:** Next.js (App Router) con React y TypeScript.
- **Base de Datos & Auth:** Supabase (PostgreSQL).
- **Estilos:** Tailwind CSS.
- **Mapas:** Leaflet (`react-leaflet`).
- **Despliegue:** Vercel.

Se te proporcionarán archivos HTML/Tailwind de referencia visual. Debes respetarlos estrictamente y convertirlos en componentes modulares de React.

---

## 2. Esquema de Base de Datos (Supabase PostgreSQL)
Crea el esquema relacional (código SQL DDL) y los tipos de TypeScript.

1. **TABLA: `vendedores` (Equipo de Ventas)**
   - Campos: `id`, `nombre` (ej. Josep Dominguez, Enrique del Rosario, Andres Chavez), `ruta_asignada`, `cuota_mensual` (Numérico), `venta_real_acumulada` (Numérico default 0).
   - Crea una columna generada o una vista que calcule el "GAP" (`cuota_mensual` - `venta_real_acumulada`) y el porcentaje de alcance.

2. **TABLA: `locales` (Mapa y Georreferenciación)**
   - Campos: `id`, `nombre_local` (ej. Rey Calle 50), `cadena` (Enum: Rey, Riba Smith, Super 99, Mr. Precio, Otro), `latitud` (Decimal), `longitud` (Decimal), `direccion`.

3. **TABLA: `tareas` (Kanban y Calendario)**
   - Campos: `id`, `vendedor_id` (Relación FK), `local_id` (Relación FK), `titulo_tarea`, `descripcion`.
   - `estado`: Enum ('por_hacer', 'en_ruta', 'completado').
   - `fecha_programada`: Timestamp (Crucial para mostrarse en el widget de calendario).
   - `tipo_tarea`: Enum ('coaching', 'trade_marketing', 'ruta_critica', 'inventario').

4. **TABLA: `registros_ventas` (Ingreso de datos rápidos)**
   - Campos: `id`, `vendedor_id`, `local_id`, `monto_facturado`, `fecha_registro`, `url_fotografia_evidencia`.
   - **CRÍTICO:** Crea un Trigger en PostgreSQL que, al insertar un registro aquí, sume automáticamente el `monto_facturado` al campo `venta_real_acumulada` de la tabla `vendedores`.

5. **VISTA: `metas_supervisor` (Consolidado)**
   - Crea una vista que sume la `cuota_mensual` global (Meta de B/. 85,000.00) y la `venta_real_acumulada` de todos los vendedores para el KPI principal.

*Nota: Incluye políticas RLS (Row Level Security) básicas permitiendo lectura/escritura a usuarios autenticados.*

---

## 3. Integración del Frontend (Next.js App Router)
A partir de los archivos HTML proporcionados (diseño "Bento Grid" y "Soft UI"):

1. **Componentización:**
   - Convierte el HTML en Server y Client Components (`<MetricCard />`, `<KanbanBoard />`, `<CalendarWidget />`, etc.).

2. **Interactividad (Client Components):**
   - **Kanban Board:** Implementa la lógica de Drag & Drop para mover tareas entre 'Por Hacer', 'En Ruta' y 'Completado'. Dispara un Server Action para actualizar el `estado` en Supabase al soltar la tarjeta.
   - **Modal Smart Input:** Conecta el formulario flotante para insertar en `registros_ventas`.
   - **Navegación:** Configura las pestañas (Ventas, Tareas, Mapa) para alternar vistas (usando estado local o `usePathname`/search params).

3. **Consumo de Datos (SSR):**
   - Usa Supabase Server Client para precargar el consolidado de ventas, el listado de tareas y los locales desde el servidor antes de renderizar la página.

---

## 4. Especificación del Módulo de Mapa Interactivo (Leaflet)
El mapa no debe usar Google Maps API, usaremos Leaflet por su flexibilidad de estilos con Tailwind.

1. **Instalación:** Usa `leaflet` y `react-leaflet`.
2. **Renderizado en Cliente (Next.js):** 
   - El componente `<MapaLocales />` DEBE cargarse dinámicamente con `next/dynamic` (`{ ssr: false }`) para evitar errores con el objeto `window` en el servidor.
3. **Capa Base (Tiles):** 
   - Usa CartoDB Positron para una estética limpia: `url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"`.
   - Centra el mapa inicial en las coordenadas de Panamá Oeste/Centro.
4. **Pines con Tailwind (`L.divIcon`):**
   - Reemplaza los pines por defecto por HTML inyectado usando Tailwind. 
   - Colores por cadena: Riba Smith (`bg-emerald-700`), Rey (`bg-blue-600`), Super 99 (`bg-rose-600`), Mr. Precio (`bg-amber-500`).
5. **Sincronización Tabla-Mapa:**
   - Al hacer clic en un botón "Ubicar" en la tabla de locales, usa `map.flyTo([lat, lng], 15)` para enfocar el pin.
6. **Integración GPS/Waze:**
   - Al seleccionar un local en el mapa, habilita un botón de "Ruta Óptima" que abra dinámicamente la URL de Waze o Google Maps pasando las coordenadas (`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`).

---

## 5. Entregables Esperados
Genera en tu respuesta de forma ordenada:
1. El código SQL (DDL, Triggers, RLS y Vistas) listo para ejecutar en Supabase.
2. Definición de tipos TypeScript generada (`types/supabase.ts`).
3. Estructura de componentes recomendada para la app en Next.js.
4. Código de los componentes principales (El Layout, el Kanban Board interactivo y el Componente Mapa dinámico).
5. Los Server Actions para la actualización de tareas y creación de ventas.