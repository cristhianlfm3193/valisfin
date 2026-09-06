# Mejores Prácticas - Luxe Estate (Checklist)

## 1. Rendimiento y SEO
*   **App Router & RSC:** Utilizar Server Components para reducir el JavaScript en el cliente.
*   **Imágenes Optimizadas:** Usar siempre `next/image`, formatos webp/avif, y `priority={true}` para el LCP.
*   **SEO Dinámico:** Implementar `generateMetadata` y etiquetas Open Graph para compartir enlaces atractivos.
*   **ISR (Incremental Static Regeneration):** Usar ISR en las páginas de detalle para velocidad estática y datos actualizados.
*   **Sitemaps:** Generar `sitemap.xml` dinámico para indexar nuevas propiedades rápidamente.

## 2. UX / UI (Experiencia Premium)
*   **Filtros en URL:** Guardar el estado de los filtros (precio, ubicación, etc.) en los *Query Params* para facilitar compartir enlaces.
*   **Micro-animaciones:** Aplicar transiciones sutiles (hover, reveals) para dar una sensación de lujo.
*   **Carga de Resultados:** Usar paginación o botón de "Cargar más" para no saturar el navegador.
*   **Mobile-First Estricto:** Asegurar carruseles táctiles (*swipe*) y botones de acción ("Contactar") de fácil acceso con el pulgar.

## 3. Mapas y Geolocalización
*   **Mapas Interactivos:** Integrar Mapbox o Google Maps con marcadores que muestren el precio directamente.
*   **Búsqueda Geoespacial:** Habilitar la extensión **PostGIS** en Supabase para búsquedas por proximidad o área.

## 4. Funcionalidades Diferenciadoras
*   **Calculadora de Hipotecas:** Widget interactivo en cada propiedad.
*   **Favoritos:** Opción de "Guardar" propiedad (usar `localStorage` para invitados, Supabase para logueados).
*   **Agendamiento:** Calendario integrado (ej. Calendly) para programar visitas.
*   **Recorridos 3D:** Soporte para integrar visualizaciones como Matterport.
*   **Autenticación sin fricción:** Implementar Magic Links o login social (Google).

## 5. Backend y Datos (Supabase)
*   **Seguridad (RLS):** Definir políticas Row Level Security para proteger los datos de los agentes y usuarios.
*   **Tipado Fuerte:** Generar y utilizar los tipos de TypeScript desde Supabase para evitar errores.
*   **Storage Optimizado:** Almacenar fotografías en Supabase Storage y entregarlas mediante `next/image`.
