import * as nodemailer from 'nodemailer'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  text: string
  html?: string
}

/**
 * Envía un correo electrónico usando la API de Gmail con OAuth2.
 * Las credenciales deben estar configuradas en .env.local
 */
export async function sendEmail(options: SendEmailOptions) {
  const user = process.env.GMAIL_USER?.trim()
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim()

  // Fallback si prefieren usar App Password en lugar de OAuth2
  const appPassword = process.env.GMAIL_APP_PASSWORD?.trim()

  if (!user) {
    throw new Error('GMAIL_USER no está configurado en las variables de entorno.')
  }

  let transporter: nodemailer.Transporter

  if (clientId && clientSecret && refreshToken) {
    // Modo OAuth2 Avanzado (Google Cloud Platform)
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: user,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken
      }
    })
  } else if (appPassword) {
    // Modo Básico (Contraseña de Aplicación)
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: appPassword
      }
    })
  } else {
    throw new Error('No se encontraron credenciales de Gmail válidas (ni OAuth2 ni App Password).')
  }

  const mailOptions = {
    from: `ValisVen <${user}>`,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Correo enviado a ${options.to} [ID: ${info.messageId}]`)
    return { success: true, messageId: info.messageId, response: info.response }
  } catch (error: any) {
    console.error(`❌ Error enviando correo a ${options.to}:`, error)
    return { success: false, error: error.message }
  }
}
