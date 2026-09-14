export function parseReportText(text: string) {
  const cleanText = text.replace(/\r/g, '').trim();

  const result: any = {
    departamento: 'POLICÍA AEROPORTUARIA',
    asunto: '',
    fecha: '',
    hora: '',
    narrativa: '',
    reporta: { rango: '', placa: '', nombre: '' },
    informa: { rango: '', placa: '', nombre: '' },
  };

  if (!cleanText) return result;

  const headerMatch = cleanText.substring(0, 300);
  if (/BATORG/i.test(headerMatch)) result.departamento = 'BATORG';
  else if (/G\.?O\.?T\.?A/i.test(headerMatch)) result.departamento = 'G.O.T.A';
  else result.departamento = 'POLICÍA AEROPORTUARIA';

  const fechaRegex = /(?:\*?(?:FECHA|Fecha)[:.]?\*?\s*([\d\/\-]+)|\[?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}))/i;
  const fechaMatch = cleanText.match(fechaRegex);
  if (fechaMatch) {
    const rawDate = (fechaMatch[1] || fechaMatch[2] || '').trim();
    const parts = rawDate.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        result.fecha = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else {
        let year = parts[2];
        if (year.length === 2) year = `20${year}`;
        result.fecha = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

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
      result.hora = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }

  const asuntoMatch = cleanText.match(/\*?(?:REPORTE|ASUNTO)\*?[:.]?\s*\n*([^\n]+)/i);
  if (asuntoMatch) {
    result.asunto = asuntoMatch[1].replace(/[*]/g, '').replace(/^[:\s]+/, '').trim();
  }

  function extractOfficer(line: string) {
    line = line.replace(/[*_~•-]/g, '').trim();
    const rankMatch = line.match(/^(Sgto\.?\s*1ro|Sgto\.?\s*2do|Cabo\s*1ro|Cabo\s*2do|Guardia|Sargento\s*1ro|Sargento\s*2do|Subteniente|Teniente|Capit[aá]n|Mayor|Subcomisionad[oa]|Comisionad[oa]|Sargento|Cabo|Sgt\.|Cb\.)\s+/i);
    
    let rango = '';
    let restOfLine = line;

    if (rankMatch) {
      rango = rankMatch[1].trim();
      restOfLine = line.substring(rankMatch[0].length).trim();
    }

    const placaMatch = restOfLine.match(/^(\d{4,6})\s+/);
    let placa = '';
    let nombre = restOfLine;

    if (placaMatch) {
      placa = placaMatch[1];
      nombre = restOfLine.substring(placaMatch[0].length).trim();
    }

    nombre = nombre.replace(/\s*\([A-Z.]+\)$/i, '').trim();

    return { rango, placa, nombre };
  }

  const reportaMatch = cleanText.match(/\*(?:REPORTA|Reporta)[:.]?\*\s*\n*([^\n]+)/i);
  if (reportaMatch) {
    const rawLine = reportaMatch[1].trim();
    result.reporta = extractOfficer(rawLine);
    if (!result.reporta.nombre) result.reporta.nombre = rawLine.replace(/[*_~•-]/g, '').trim();
  }

  const informaMatch = cleanText.match(/\*(?:INFORMA|Informa)[:.]?\*\s*\n*([^\n]+)/i);
  if (informaMatch) {
    const rawLine = informaMatch[1].trim();
    result.informa = extractOfficer(rawLine);
    if (!result.informa.nombre) result.informa.nombre = rawLine.replace(/[*_~•-]/g, '').trim();
  }

  if (!result.reporta.nombre && result.informa.nombre) {
    result.reporta = { ...result.informa };
  } else if (!result.informa.nombre && result.reporta.nombre) {
    result.informa = { ...result.reporta };
  }

  let inicioDetalle = cleanText.match(/\*(?:NARRATIVA|OBSERVACI[OÓ]N|DETALLE|DESARROLLO)[:.]?\*\s*\n*/i);
  if (inicioDetalle && inicioDetalle.index !== undefined) {
    const startIndex = inicioDetalle.index + inicioDetalle[0].length;
    const finMatch = cleanText.substring(startIndex).match(/\*(?:INFORMA|REPORTA|DIOS|PA\s*\*Dios)/i);
    let endIndex = cleanText.length;
    if (finMatch && finMatch.index !== undefined) {
      endIndex = startIndex + finMatch.index;
    }
    result.narrativa = cleanText.substring(startIndex, endIndex).trim();
  } else if (asuntoMatch && asuntoMatch.index !== undefined) {
    const startIndex = asuntoMatch.index + asuntoMatch[0].length;
    const finMatch = cleanText.substring(startIndex).match(/\*(?:INFORMA|REPORTA|DIOS|PA\s*\*Dios)/i);
    let endIndex = cleanText.length;
    if (finMatch && finMatch.index !== undefined) {
      endIndex = startIndex + finMatch.index;
    }
    result.narrativa = cleanText.substring(startIndex, endIndex).trim();
  }

  return result;
}
