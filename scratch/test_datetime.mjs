function parseDateTime(cleanText) {
  let fecha = '';
  let hora = '';

  // a. Extracción de Fecha
  const fechaRegex = /(?:\*?(?:FECHA|Fecha)[:.]?\*?\s*([\d\/\-]+)|\[?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}))/i;
  const fechaMatch = cleanText.match(fechaRegex);
  if (fechaMatch) {
    const rawDate = (fechaMatch[1] || fechaMatch[2] || '').trim();
    const parts = rawDate.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        fecha = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        let year = parts[2];
        if (year.length === 2) year = `20${year}`;
        fecha = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

  // b. Extracción de Hora
  const horaRegex = /(?:\*?(?:HORA|Hora|HORARIO|Horario)[:.]?\*?\s*([\d:]{3,8}(?:\s*(?:[ap]\.?\s*m\.?|hrs|horas))?)|[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s*m\.?)?))/i;
  const horaMatch = cleanText.match(horaRegex);
  if (horaMatch) {
    const rawHora = (horaMatch[1] || horaMatch[2] || '').trim().toLowerCase();
    const isPM = /p\.?\s*m\.?/i.test(rawHora);
    const isAM = /a\.?\s*m\.?/i.test(rawHora);
    const timeDigitsMatch = rawHora.match(/(\d{1,2}):(\d{2})/);
    if (timeDigitsMatch) {
      let hours = parseInt(timeDigitsMatch[1], 10);
      const minutes = timeDigitsMatch[2];
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
      hora = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }

  return { fecha, hora };
}

console.log('1. *FECHA:* 12/09/2026 *HORA:* 08:30 ->', parseDateTime('*FECHA:* 12/09/2026\n*HORA:* 08:30'));
console.log('2. Fecha: 05/09/2026 Hora: 04:15 p.m. ->', parseDateTime('Fecha: 05/09/2026\nHora: 04:15 p.m.'));
console.log('3. [13/09/2026, 21:45] WhatsApp text ->', parseDateTime('[13/09/2026, 21:45] Mensaje operativo'));
console.log('4. *HORA:* 11:30 hrs ->', parseDateTime('*HORA:* 11:30 hrs\n*FECHA:* 10-09-2026'));
