export function parseReportText(text: string): any {
  const result: any = {
    departamento: 'POLICÍA AEROPORTUARIA',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
    asunto: 'Recorrido Perimetral',
    narrativa: '',
    areas_recorrido: '',
    equipos_novedad: '',
    reporta: { rango: '', placa: '', nombre: '' },
    informa: { rango: '', placa: '', nombre: '' },
    vehiculos: [],
    unidades: []
  };

  if (!text) return result;

  // Normalizar saltos de línea y guiones tipográficos (en-dash, em-dash, etc.)
  const cleanText = text
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\r\n/g, '\n');

  // 1. Departamento / Base
  if (/BATORG|BATOR/i.test(cleanText)) {
    result.departamento = 'BATORG';
  } else if (/G\.O\.T\.A|GOTA/i.test(cleanText)) {
    result.departamento = 'G.O.T.A';
  } else if (/POLICÍA AEROPORTUARIA|DINOA|AVSEC/i.test(cleanText)) {
    result.departamento = 'POLICÍA AEROPORTUARIA';
  }

  const rangosRegexStr = 'Comisionada|Comisionado|Subcomisionada|Subcomisionado|Mayor|Capitán|Capitan|Teniente|Subteniente|Sargento1ro|Sargento2do|Sgto1ro|Sgto2do|Sgto\\.?\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Sargento\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Cabo1ro|Cabo2do|Cabo\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Inspector(?:a)?|Guardia|Agente';

  function normalizeRank(r: string): string {
    if (!r) return '';
    const clean = r.trim().toLowerCase();
    if (clean.includes('sgto') || clean.includes('sargento')) {
      if (clean.includes('1')) return 'Sargento 1ro.';
      if (clean.includes('2')) return 'Sargento 2do.';
      return 'Sargento 1ro.';
    }
    if (clean.includes('cabo')) {
      if (clean.includes('1')) return 'Cabo 1ro.';
      if (clean.includes('2')) return 'Cabo 2do.';
      return 'Cabo 1ro.';
    }
    if (clean.includes('comisionad')) {
      if (clean.includes('sub')) return 'Subcomisionado';
      return 'Comisionado';
    }
    if (clean.includes('subteniente')) return 'Subteniente';
    if (clean.includes('teniente')) return 'Teniente';
    if (clean.includes('mayor')) return 'Mayor';
    if (clean.includes('capit')) return 'Capitán';
    if (clean.includes('inspector')) return 'Inspector';
    if (clean.includes('guardia')) return 'Guardia';
    return r.trim();
  }

  function extractOfficer(line: string) {
    if (!line) return null;
    const cleanLine = line
      .replace(/^[\s•*\-\d.]+(?=\s|[a-zA-ZÁÉÍÓÚáéíóúÑñ])/i, '')
      .replace(/\s*\([^)]*\)[.\s]*$/, '')
      .replace(/[*_~]/g, '')
      .trim();

    // Patrón 1: [Rango] [Placa (4 a 6 dígitos)] [Nombre Completo]
    const p1 = new RegExp(`^(${rangosRegexStr})\\s+(\\d{4,6})\\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+)$`, 'i');
    const m1 = cleanLine.match(p1);
    if (m1) {
      return {
        rango: normalizeRank(m1[1]),
        placa: m1[2].trim(),
        nombre: m1[3].trim()
      };
    }

    // Patrón 2: [Rango] [Nombre] con CIP/Placa: [Placa]
    const p2 = new RegExp(`^(${rangosRegexStr})?\\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+?)(?:\\s+con\\s+(?:CIP|Placa)[\\s.:]*([\\w.-]+))?$`, 'i');
    const m2 = cleanLine.match(p2);
    if (m2 && m2[2] && m2[2].trim().length > 3) {
      return {
        rango: normalizeRank(m2[1] || 'Guardia'),
        placa: m2[3] ? m2[3].replace(/[^\w-]/g, '').trim() : '',
        nombre: m2[2].trim()
      };
    }

    // Patrón 3: [Nombre] [Cédula o Placa] (ej: Ixan Barría 8-946-2084)
    const p3 = /^([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)\s+([\d-]{5,15})$/i;
    const m3 = cleanLine.match(p3);
    if (m3 && m3[1].trim().length > 3) {
      return {
        rango: 'Conductor / Agente',
        placa: m3[2].trim(),
        nombre: m3[1].trim()
      };
    }

    return null;
  }

  // 2. Extraer Conductor / Vehículo de Bloque (ej. *Conductor de AVSEC:* - *Ixan Barría* 8-946-2084)
  const conductorBlockRegex = /\*Conductor(?:\s+de\s+([^*:]+))?[:.]?\*\s*\n*([\s\S]*?)(?=\*(?:Unidad|INFORMA|Informa|REPORTA|Reporta|Correría|Pursto|Puesto|DIOS)|$)/gi;
  let condBlockMatch: RegExpExecArray | null;
  while ((condBlockMatch = conductorBlockRegex.exec(cleanText)) !== null) {
    const base = condBlockMatch[1] ? condBlockMatch[1].trim() : 'AVSEC';
    const lines = condBlockMatch[2].split('\n');
    for (const l of lines) {
      const cleanL = l.trim();
      if (!cleanL || cleanL.startsWith('*') || cleanL.toUpperCase().includes('DIOS')) continue;
      const officer = extractOfficer(cleanL);
      if (officer) {
        result.vehiculos.push({
          numero_movil: `Móvil ${base}`,
          placa_vehiculo: base,
          conductor_nombre: officer.nombre,
          conductor_id: officer.placa,
          correria: 'Patrullaje'
        });
        if (/AVSEC/i.test(base)) result.departamento = 'POLICÍA AEROPORTUARIA';
        else if (/BATOR/i.test(base)) result.departamento = 'BATORG';
      }
    }
  }

  // 3. Extraer Unidad Aeronaval / Unidades de Bloque (ej. *Unidad Aeronaval.* - Cabo1ro 71310 *Luis Charles*)
  const unidadBlockRegex = /\*Unidad(?:\s+Aeronaval)?[:.]?\*\s*\n*([\s\S]*?)(?=\*(?:REPORTA|Reporta|INFORMA|Informa|Conductor|Correría|Pursto|Puesto|DIOS)|$)/gi;
  let uniBlockMatch: RegExpExecArray | null;
  while ((uniBlockMatch = unidadBlockRegex.exec(cleanText)) !== null) {
    const lines = uniBlockMatch[1].split('\n');
    for (const l of lines) {
      const cleanL = l.trim();
      if (!cleanL || cleanL.startsWith('*') || cleanL.toUpperCase().includes('DIOS')) continue;
      const officer = extractOfficer(cleanL);
      if (officer && !result.unidades.some((u: any) => u.nombre.toLowerCase() === officer.nombre.toLowerCase())) {
        result.unidades.push({
          rol: 'Unidad Aeronaval',
          rango: officer.rango,
          placa_institucional: officer.placa,
          nombre: officer.nombre,
          destino: ''
        });
      }
    }
  }

  // 4. Extraer *REPORTA:* o *Reporta:*
  const reportaMatch = cleanText.match(/\*(?:REPORTA|Reporta)[:.]?\*\s*\n*([^\n*]+(?:\s*\*[^\n*]+\*)?)/i);
  if (reportaMatch) {
    const rawLine = reportaMatch[1].trim();
    const officer = extractOfficer(rawLine);
    if (officer) {
      result.reporta = officer;
    } else {
      result.reporta.nombre = rawLine.replace(/[*_~•-]/g, '').trim();
    }
  }

  // 5. Extraer *INFORMA:* o *Informa:*
  const informaMatch = cleanText.match(/\*(?:INFORMA|Informa)[:.]?\*\s*\n*([^\n*]+(?:\s*\*[^\n*]+\*)?)/i);
  if (informaMatch) {
    const rawLine = informaMatch[1].trim();
    const officer = extractOfficer(rawLine);
    if (officer) {
      result.informa = officer;
    } else {
      result.informa.nombre = rawLine.replace(/[*_~•-]/g, '').trim();
    }
  }

  // 6. Extraer *Correría:* o *Correria:*
  const correriaMatch = cleanText.match(/\*Correr[ií]a:\*\s*([^\n*]+)/i);
  if (correriaMatch) {
    const rawLine = correriaMatch[1].trim();
    const officer = extractOfficer(rawLine);
    if (officer) {
      if (!result.reporta.nombre) {
        result.reporta = { ...officer };
      }
      if (!result.unidades.some((u: any) => u.placa_institucional === officer.placa && officer.placa)) {
        result.unidades.push({
          rol: 'Correría / Patrullaje',
          rango: officer.rango,
          placa_institucional: officer.placa,
          nombre: officer.nombre,
          destino: ''
        });
      }
    }
  }

  // Sincronizar Informa y Reporta si alguno quedó vacío
  if (!result.reporta.nombre && result.informa.nombre) {
    result.reporta = { ...result.informa };
  } else if (!result.informa.nombre && result.reporta.nombre) {
    result.informa = { ...result.reporta };
  }

  // 7. Fecha y Hora del Operativo (la que manda en el reporte)
  // a. Extracción de Fecha (soporta *FECHA:*, Fecha:, o timestamp inicial [DD/MM/YYYY])
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

  // b. Extracción de Hora y conversión a formato HH:MM (24h)
  // Ejemplos: *HORA:* 14:30, Hora: 04:15 p. m., 08:30 PM, 14:30 hrs, [..., 21:45]
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

  // 8. Asunto
  const reporteMatch = cleanText.match(/\*(?:REPORTE|ASUNTO)[:.]?\*\s*([^\n]+)/i);
  if (reporteMatch) {
    const rawAsunto = reporteMatch[1].replace('.', '').trim().toLowerCase();
    if (rawAsunto.includes('recorrido')) result.asunto = 'Recorrido Perimetral';
    else if (rawAsunto.includes('relevo') || rawAsunto.includes('fijo') || rawAsunto.includes('puesto') || rawAsunto.includes('turno') || rawAsunto.includes('torre') || rawAsunto.includes('portón') || rawAsunto.includes('porton')) result.asunto = 'Relevo de Turno / Puesto Fijo';
    else if (rawAsunto.includes('traslado')) result.asunto = 'Traslado de Personal';
    else result.asunto = reporteMatch[1].replace(/[*.]/g, '').trim(); 
  } else if (/Puesto|Pursto|A\.I\.P\.P/i.test(cleanText)) {
    result.asunto = 'Relevo de Turno / Puesto Fijo';
  }

  // 9. Puestos y Unidades (ej: *Puesto la Retractil:* o *Pursto la Retractil:*)
  const puestoBlockRegex = /\*(?:Puesto|Pursto)\s*([^:*]+)\*:\s*([\s\S]*?)(?=\*(?:Informa|INFORMA|Reporta|REPORTA|Correría|Narrativa|Áreas|Equipos|Novedad)|PA\s*\*Dios|DIOS|$)/gi;
  let puestoMatch: RegExpExecArray | null;
  while ((puestoMatch = puestoBlockRegex.exec(cleanText)) !== null) {
    const puestoNombre = puestoMatch[1].trim();
    const puestoLines = puestoMatch[2].split('\n');
    for (const line of puestoLines) {
      const cleanL = line.trim();
      if (!cleanL || cleanL.startsWith('*') || cleanL.toUpperCase().includes('DIOS')) continue;
      const officer = extractOfficer(cleanL);
      if (officer && !result.unidades.some((u: any) => u.nombre.toLowerCase() === officer.nombre.toLowerCase())) {
        result.unidades.push({
          rol: puestoNombre ? `Puesto ${puestoNombre}` : 'Patrullaje',
          rango: officer.rango,
          placa_institucional: officer.placa,
          nombre: officer.nombre,
          destino: puestoNombre
        });
      }
    }
  }

  // 9.5 Unidades Entrantes y Salientes
  const unidadesBloqueRegex = /\*(?:UNIDADES\s+)?(SALIENTES|ENTRANTES|SALIENTE|ENTRANTE)[:.]?\*\s*([\s\S]*?)(?=\*(?:UNIDADES|INFORMA|REPORTA|CORRER[IÍ]A|NARRATIVA|ÁREAS|AREAS|EQUIPOS|NOVEDAD|DIOS|PUESTO|PURSTO)[:.]?\*|$)/gi;
  let unidadesMatch;
  let blockCount = 0;
  while ((unidadesMatch = unidadesBloqueRegex.exec(cleanText)) !== null) {
    let tipo = unidadesMatch[1].toUpperCase();
    blockCount++;
    if (tipo.includes('SALIENTE') && blockCount > 1 && (cleanText.match(/\*UNIDADES\s+SALIENTES/gi)?.length || 0) > 1) {
      // Manejo de error humano si ponen "SALIENTES" dos veces (el 2do suele ser ENTRANTES)
      tipo = 'ENTRANTE';
    }
    
    const lines = unidadesMatch[2].split('\n');
    for (const line of lines) {
      const cleanL = line.trim();
      if (!cleanL || cleanL.startsWith('*') || cleanL.toUpperCase().includes('DIOS')) continue;
      const officer = extractOfficer(cleanL);
      if (officer && !result.unidades.some((u: any) => u.placa_institucional === officer.placa && u.placa_institucional)) {
        result.unidades.push({
          rol: tipo.includes('SALIENTE') ? 'Saliente' : 'Entrante',
          rango: officer.rango,
          placa_institucional: officer.placa,
          nombre: officer.nombre,
          destino: ''
        });
      }
    }
  }

  // Otras unidades con rango y placa en el cuerpo del texto
  const genericOfficerRegex = new RegExp(`(?:•|-)?\\s*(${rangosRegexStr})\\s+(\\d{4,6})\\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\\s*]+?)(?=\\n|$)`, 'gi');
  let match: RegExpExecArray | null;
  while ((match = genericOfficerRegex.exec(cleanText)) !== null) {
    const r = normalizeRank(match[1]);
    const p = match[2].trim();
    const n = match[3].replace(/[*_~]/g, '').trim();
    if (n.length < 45 && !result.unidades.some((u: any) => u.placa_institucional === p || u.nombre.toLowerCase().includes(n.toLowerCase()))) {
      result.unidades.push({
        rol: 'Patrullaje',
        rango: r,
        placa_institucional: p,
        nombre: n,
        destino: ''
      });
    }
  }

  // 10. Vehículos en líneas sueltas
  const vehiculoRegex = /(?:•|-)?\s*(?:en\s+el\s+)?(?:m[oó]vil|veh[ií]culo|patrulla)\s*(?:#|nº|no\.?)?\s*(\d+)?(?:\s+(?:de\s+)?(BATORG?|AVSEC|DINOA|[A-Z]{2,4}\s*[-]?\s*\d{3,5}))?(?:\s*con\s+matr[ií]cula:\s*\*?([A-Z0-9-]{4,10})\*?)?/gi;
  while ((match = vehiculoRegex.exec(cleanText)) !== null) {
    const numMovil = match[1] ? `Móvil ${match[1]}` : 'Móvil';
    const extraToken = match[2] ? match[2].trim() : '';
    const matriculaExtra = match[3] ? match[3].trim() : '';

    let placaReal = '';
    if (matriculaExtra) {
      placaReal = matriculaExtra.toUpperCase().replace(/[*_]/g, '');
    } else if (extraToken && /^[A-Z]{1,3}\s*[-]?\s*\d{3,5}$/i.test(extraToken)) {
      placaReal = extraToken.toUpperCase().replace(/\s+/g, '');
    }

    if (/BATOR/i.test(extraToken) || /BATOR/i.test(cleanText)) {
      result.departamento = 'BATORG';
    }

    const restOfLine = cleanText.substring(match.index, cleanText.indexOf('\n', match.index) !== -1 ? cleanText.indexOf('\n', match.index) : cleanText.length);
    let conductorNombre = '';
    let conductorId = '';

    const condMatch = restOfLine.match(/conducid[oa]\s+por\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\s\d.-]+)/i);
    if (condMatch) {
      const condOfficer = extractOfficer(condMatch[1]);
      if (condOfficer) {
        conductorNombre = `${condOfficer.rango} ${condOfficer.nombre}`.trim();
        conductorId = condOfficer.placa;
      } else {
        conductorNombre = condMatch[1].replace(/[*_~]/g, '').trim();
      }
    }

    if (!result.vehiculos.some((v: any) => v.numero_movil === numMovil && numMovil !== 'Móvil')) {
      result.vehiculos.push({
        numero_movil: numMovil,
        placa_vehiculo: placaReal,
        conductor_nombre: conductorNombre,
        conductor_id: conductorId,
        correria: 'Patrullaje'
      });
    }
  }

  // 11. Narrativa / Observación Operativa
  const narrativaExplicitMatch = cleanText.match(/\*(?:NARRATIVA|OBSERVACI[OÓ]N|NOVEDAD(?:ES)?):\*\s*([\s\S]*?)(?=\*(?:ÁREAS|AREAS|EQUIPOS|INFORMA|REPORTA|CORRERÍA|PURSTO|PUESTO|DIOS):\*|•En el movil|Movil|Unidad|\n-|$)/i);
  if (narrativaExplicitMatch && narrativaExplicitMatch[1].trim().length > 3) {
    result.narrativa = narrativaExplicitMatch[1].trim();
  } else {
    const narrativeParts: string[] = [];

    if (result.vehiculos.length > 0) {
      const conds = result.vehiculos.map((v: any) => `${v.numero_movil} con conductor ${v.conductor_nombre || 'de servicio'} (${v.conductor_id || v.placa_vehiculo})`).join(', ');
      narrativeParts.push(`Móviles de servicio: ${conds}.`);
    }

    if (result.unidades.length > 0) {
      const puestosDesc = result.unidades.map((u: any) => `${u.rol}: ${u.rango} ${u.nombre} (${u.placa_institucional || 'Sin Placa'})`).join(', ');
      narrativeParts.push(`Personal de servicio: ${puestosDesc}.`);
    }

    if (result.reporta.nombre) {
      narrativeParts.push(`Oficial a cargo: ${result.reporta.rango} ${result.reporta.nombre} (${result.reporta.placa || ''}).`);
    }

    narrativeParts.push('Servicio operativo ejecutado sin novedades de relevancia. Dios, Patria y Honor.');
    result.narrativa = narrativeParts.join(' ');
  }

  // 12. Áreas
  const areasMatch = cleanText.match(/\*(?:ÁREAS|AREAS):\*\s*([\s\S]*?)(?=\*(?:EQUIPOS|NOVEDAD(?:ES)?|INFORMA|REPORTA|CONDUCTOR|VEH[IÍ]CULO|UNIDAD|DIOS)[:.]?\*|•En el movil|Movil|Unidad|$)/i);
  if (areasMatch) {
    const rawAreas = areasMatch[1].trim();
    const cleanAreas = rawAreas.split('\n')
      .filter(a => a.trim().startsWith('-') || a.trim().length > 2)
      .map(a => a.replace(/^-?\s*/, '').trim())
      .join(', ');
    result.areas_recorrido = cleanAreas || rawAreas;
  }

  // Consolidar vehículos duplicados (genérico vs específico)
  if (result.vehiculos.length > 1) {
    const generic = result.vehiculos.find((v: any) => v.numero_movil === 'Móvil AVSEC' || v.numero_movil === 'Móvil BATORG' || v.numero_movil === 'Móvil');
    const specific = result.vehiculos.find((v: any) => v !== generic && v.numero_movil !== 'Móvil AVSEC' && v.numero_movil !== 'Móvil BATORG');
    
    if (generic && specific) {
      if (!specific.conductor_nombre) {
        specific.conductor_nombre = generic.conductor_nombre;
        specific.conductor_id = generic.conductor_id;
      }
      if (!specific.placa_vehiculo || specific.placa_vehiculo === 'AVSEC' || specific.placa_vehiculo === 'BATORG') {
        specific.placa_vehiculo = (generic.placa_vehiculo && generic.placa_vehiculo !== 'AVSEC' && generic.placa_vehiculo !== 'BATORG') ? generic.placa_vehiculo : specific.placa_vehiculo;
      }
      result.vehiculos = result.vehiculos.filter((v: any) => v !== generic);
    }
  }

  return result;
}
