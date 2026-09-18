import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad | ValisHub',
  description: 'Política de Privacidad de ValisHub',
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-white py-12 px-4 sm:px-6 lg:px-8 relative z-50">
      <div className="max-w-3xl mx-auto relative">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Volver al inicio
          </Link>
        </div>

        <div className="bg-[#121c27]/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-teal-400 via-emerald-400 to-pink-400 shadow-[0_0_15px_rgba(45,212,191,0.2)] shrink-0">
              <div className="w-full h-full rounded-full bg-[#090a0f] flex items-center justify-center">
                <span className="text-xl font-bold text-white">V</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Política de Privacidad</h1>
              <p className="text-sm text-teal-400/80 font-medium">Última actualización: 17 de septiembre de 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300 text-sm sm:text-base leading-relaxed">
            
            <section>
              <h2 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                Introducción
              </h2>
              <p>Bienvenido a ValisHub. Esta Política de Privacidad describe cómo recopilamos, utilizamos, procesamos y protegemos su información personal y comercial cuando utiliza nuestro ecosistema de aplicaciones web y sus módulos integrados.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                Información que Recopilamos
              </h2>
              <p className="mb-2">Para brindarle un servicio eficiente, nuestro sistema recopila y procesa los siguientes tipos de datos:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Recopilamos información de finanzas personales, presupuestos familiares y control de gastos a través del módulo ValisFin.</li>
                <li>Procesamos datos comerciales, métricas de ventas, gestión de locales, clientes e inventario a través de los módulos ValisBiz y ValisVen.</li>
                <li>Almacenamos información relacionada con la venta de licencias digitales y suscripciones, incluyendo fechas de expiración y credenciales.</li>
                <li>Recopilamos fotografías e imágenes de documentos físicos, como facturas de clientes y reportes de ventas en Excel (Keiko), que usted suba voluntariamente al sistema.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 w-6 h-6 rounded flex items-center justify-center text-xs">3</span>
                Cómo Utilizamos su Información e Inteligencia Artificial
              </h2>
              <p className="mb-2">Nuestra plataforma utiliza tecnología de vanguardia para automatizar procesos y facilitar la gestión de sus datos:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Utilizamos los datos recopilados para generar tableros analíticos (dashboards) y reportes automatizados sobre el estado general de sus finanzas o métricas de negocio.</li>
                <li>Empleamos inteligencia artificial mediante Google Gemini 3.5 Flash Lite exclusivamente para el procesamiento de imágenes y reconocimiento óptico de caracteres (OCR).</li>
                <li>Este asistente de inteligencia artificial (ValisAI) lee las fotografías de sus recibos para extraer montos y autocompletar formularios, agilizando la entrada de datos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 w-6 h-6 rounded flex items-center justify-center text-xs">4</span>
                Proveedores de Servicios de Terceros
              </h2>
              <p className="mb-2">Para el funcionamiento óptimo y seguro de la plataforma, nos apoyamos en infraestructuras de terceros altamente seguras:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>El frontend de nuestra aplicación está desplegado y alojado en los servidores de Vercel.</li>
                <li>Toda la base de datos y la gestión de autenticación de usuarios operan a través de Supabase, utilizando bases de datos PostgreSQL.</li>
                <li>Las funciones de inteligencia artificial y lectura de imágenes son procesadas a través de la API de Google Gemini.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 w-6 h-6 rounded flex items-center justify-center text-xs">5</span>
                Seguridad de los Datos
              </h2>
              <p className="mb-2">La protección de su información es nuestra prioridad. Implementamos rigurosas medidas de seguridad a nivel de arquitectura:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Garantizamos el acceso restringido a los datos en la base de datos mediante políticas de Row Level Security (RLS) en Supabase.</li>
                <li>Toda comunicación y petición de datos desde la interfaz de usuario hacia la base de datos se realiza de forma protegida utilizando Server Actions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 w-6 h-6 rounded flex items-center justify-center text-xs">6</span>
                Retención y Derechos del Usuario
              </h2>
              <p>Usted tiene el derecho de acceder, modificar o solicitar la eliminación de su información y de los archivos subidos a la plataforma en cualquier momento. Los datos serán retenidos únicamente durante el tiempo que su cuenta permanezca activa o mientras sea necesario para brindarle el servicio de monitoreo y soporte.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 w-6 h-6 rounded flex items-center justify-center text-xs">7</span>
                Contacto
              </h2>
              <p>Si tiene alguna duda sobre esta Política de Privacidad o el manejo de sus datos, por favor contacte al administrador del sistema o al soporte técnico designado para su cuenta.</p>
            </section>

          </div>
          
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
            <p>ValisHub • Ecosistema Seguro</p>
            <p>Panamá, 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
