import { sendEmail } from '../lib/email'

async function test() {
  console.log('Probando envío de correo...')
  const result = await sendEmail({
    to: 'cristhianf3193@gmail.com', // El mismo correo de prueba
    subject: 'Prueba ValisVen OAuth2',
    text: 'Si te llega este correo, ¡la configuración de la API de Gmail con OAuth2 fue un éxito total!'
  })
  console.log('Resultado:', result)
}

test()
