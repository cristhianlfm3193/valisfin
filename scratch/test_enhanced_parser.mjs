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

  const cleanText = text.replace(/\r\n/g, '\n');

  // 1. Departamento / Base
  if (/BATORG|BATOR/i.test(cleanText)) {
    result.departamento = 'BATORG';
  } else if (/G\.O\.T\.A|GOTA/i.test(cleanText)) {
    result.departamento = 'G.O.T.A';
  } else if (/POLICÍA AEROPORTUARIA|DINOA|AVSEC/i.test(cleanText)) {
    result.departamento = 'POLICÍA AEROPORTUARIA';
  }

  const rangosRegexStr = 'Comisionada|Comisionado|Subcomisionada|Subcomisionado|Mayor|Capitán|Capitan|Teniente|Subteniente|Sgto\\.?\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Sargento\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Cabo\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Inspector(?:a)?|Guardia|Agente';

  // Helper para extraer Rango, Placa y Nombre de una línea
  function extractOfficer(line: string) {
    if (!line) return null;
    const cleanLine = line.replace(/[*_~]/g, '').trim();
    
    // Pattern: [Rango] [Placa (4-6 dígitos)] [Nombre Completo]
    const p1 = new RegExp(`^(${rangosRegexStr})\\s+(\\d{4,6})\\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+)$`, 'i');
    const m1 = cleanLine.match(p1);
    if (m1) {
      return {
        rango: normalizeRank(m1[1]),
        placa: m1[2].trim(),
        nombre: m1[3].trim()
      };
    }

    // Pattern: [Rango] [Nombre] con CIP / Placa: [Placa/CIP]
    const p2 = new RegExp(`^(${rangosRegexStr})?\\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+?)(?:\\s+con\\s+(?:CIP|Placa)[\\s.:]*([\\w.-]+))?$`, 'i');
    const m2 = cleanLine.match(p2);
    if (m2 && m2[2] && m2[2].trim().length > 3) {
      return {
        rango: normalizeRank(m2[1] || 'Guardia'),
        placa: m2[3] ? m2[3].replace(/[^\w-]/g, '').trim() : '',
        nombre: m2[2].trim()
      };
    }

    return null;
  }

  function normalizeRank(r: string): string {
    if (!r) return '';
    const clean = r.trim().toLowerCase();
    if (clean.includes('sgto') || clean.includes('sargento')) {
      if (clean.includes('1')) return 'Sargento 1ro.';
      if (clean.includes('2')) return 'Sargento 2do.';
      return 'Sargento 2do.';
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

  // 2. Extraer *Informa:*
  const informaMatch = cleanText.match(/\*Informa:\*\s*([^\n*]+)(?:\n\*?([^\n*]+)\*?)?/i);
  if (informaMatch) {
    const rawLine = informaMatch[1].trim();
    const officer = extractOfficer(rawLine);
    if (officer) {
      result.informa = officer;
    } else {
      result.informa.nombre = rawLine.replace(/[*_~]/g, '').trim();
    }
  }

  // 3. Extraer *Reporta:*
  const reportaMatch = cleanText.match(/\*Reporta:\*\s*([^\n*]+)/i);
  if (reportaMatch) {
    const rawLine = reportaMatch[1].trim();
    const officer = extractOfficer(rawLine);
    if (officer) {
      result.reporta = officer;
    } else {
      result.reporta.nombre = rawLine.replace(/[*_~]/g, '').trim();
    }
  }

  // 4. Extraer *Correría:* o *Correria:*
  const correriaMatch = cleanText.match(/\*Correr[ií]a:\*\s*([^\n*]+)/i);
  if (correriaMatch) {
    const rawLine = correriaMatch[1].trim();
    const officer = extractOfficer(rawLine);
    if (officer) {
      // Si reporta aún está vacío, el encargado de correría suele ser quién reporta
      if (!result.reporta.nombre) {
        result.reporta = { ...officer };
      }
      // También lo agregamos a patrullaje
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

  // Si Informa tiene datos y Reporta no, o viceversa:
  if (!result.reporta.nombre && result.informa.nombre) {
    result.reporta = { ...result.informa };
  } else if (!result.informa.nombre && result.reporta.nombre) {
    result.informa = { ...result.reporta };
  }

  // 5. Fecha y Hora
  const fechaMatch = cleanText.match(/\*FECHA:\*\s*([\d\/\-]+)/i);
  if (fechaMatch) {
    const rawDate = fechaMatch[1];
    const parts = rawDate.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) result.fecha = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      else result.fecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  const horaMatch = cleanText.match(/\*HORA:\*\s*([\d:]+)/i);
  if (horaMatch) {
    result.hora = horaMatch[1].trim();
  }

  // 6. Asunto
  const reporteMatch = cleanText.match(/\*REPORTE:\*\s*([^\n]+)/i);
  if (reporteMatch) {
    const rawAsunto = reporteMatch[1].replace('.', '').trim().toLowerCase();
    if (rawAsunto.includes('recorrido')) result.asunto = 'Recorrido Perimetral';
    else if (rawAsunto.includes('relevo') || rawAsunto.includes('fijo') || rawAsunto.includes('puesto')) result.asunto = 'Relevo de Turno / Puesto Fijo';
    else if (rawAsunto.includes('traslado')) result.asunto = 'Traslado de Personal';
    else result.asunto = reporteMatch[1].replace(/[*.]/g, '').trim(); 
  } else if (/Puesto|Pursto/i.test(cleanText)) {
    result.asunto = 'Relevo de Turno / Puesto Fijo';
  }

  // 7. Puestos y Unidades (ej: *Puesto la Retractil:* o *Pursto la Retractil:*)
  const puestoBlockRegex = /\*(?:Puesto|Pursto)\s*([^:*]+)\*:\s*([\s\S]*?)(?=\*(?:Informa|Reporta|Correría|Narrativa|Áreas|Equipos|Novedad)|PA\s*\*Dios|$)/gi;
  let puestoMatch: RegExpExecArray | null;
  while ((puestoMatch = puestoBlockRegex.exec(cleanText)) !== null) {
    const puestoNombre = puestoMatch[1].trim();
    const puestoLines = puestoMatch[2].split('\n');
    for (const line of puestoLines) {
      const cleanL = line.trim();
      if (!cleanL || cleanL.startsWith('*') || cleanL.startsWith('PA')) continue;
      const officer = extractOfficer(cleanL);
      if (officer && !result.unidades.some((u: any) => u.nombre.toLowerCase() === officer.nombre.toLowerCase())) {
        result.unidades.push({
          rol: puestoNombre ? `Puesto ${puestoNombre}` : 'Entrante',
          rango: officer.rango,
          placa_institucional: officer.placa,
          nombre: officer.nombre,
          destino: puestoNombre
        });
      }
    }
  }

  // Extrae unidades con CIP: "- *Misael Ramirez* con CIP: *8-984-1825.*"
  const unidadesCipRegex = /(?:•|-)?\s*\*?([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)\*?\s+con\s+CIP\.?:\s*\*?([\d\-\.]+)\*?/gi;
  let match: RegExpExecArray | null;
  while ((match = unidadesCipRegex.exec(cleanText)) !== null) {
    const nom = match[1].trim();
    const cip = match[2].replace('.', '').trim();
    if (!result.unidades.some((u: any) => u.nombre.toLowerCase().includes(nom.toLowerCase()))) {
      result.unidades.push({
        rol: 'Patrullaje',
        rango: 'Inspector',
        nombre: nom,
        placa_institucional: cip,
        destino: ''
      });
    }
  }

  // Extrae otras unidades en general: "Guardia 83404 Irving Barba"
  const genericOfficerRegex = new RegExp(`(?:•|-)?\\s*(${rangosRegexStr})\\s+(\\d{4,6})\\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+?)(?=\\n|$)`, 'gi');
  while ((match = genericOfficerRegex.exec(cleanText)) !== null) {
    const r = normalizeRank(match[1]);
    const p = match[2].trim();
    const n = match[3].trim();
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

  // 8. Vehículos Involucrados
  // Detecta patrones como:
  // "• En el movil 1064 de BATOR"
  // "Móvil 95 EN5327"
  // "Vehículo 38 con conductor Guardia 83404 Irving Barba"
  const vehiculoRegex = /(?:•|-)?\s*(?:en\s+el\s+)?(?:m[oó]vil|veh[ií]culo|patrulla)\s*(?:#|nº|no\.?)?\s*(\d+)?(?:\s+(?:de\s+)?(BATORG?|AVSEC|DINOA|[A-Z]{2,4}\s*[-]?\s*\d{3,5}))?/gi;
  
  while ((match = vehiculoRegex.exec(cleanText)) !== null) {
    const numMovil = match[1] ? `Móvil ${match[1]}` : 'Móvil';
    let extraToken = match[2] ? match[2].trim() : '';

    let placaReal = '';
    // Si el token extra es una placa real (ej: EN5327, AB-1048)
    if (extraToken && /^[A-Z]{1,3}\s*[-]?\s*\d{3,5}$/i.test(extraToken)) {
      placaReal = extraToken.toUpperCase().replace(/\s+/g, '');
    }

    // Si es BATOR o BATORG o AVSEC:
    if (/BATOR/i.test(extraToken) || /BATOR/i.test(cleanText)) {
      result.departamento = 'BATORG';
    }

    // Conductor en la misma línea
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

    // Evitar duplicar el mismo móvil
    if (!result.vehiculos.some((v: any) => v.numero_movil === numMovil && numMovil !== 'Móvil')) {
      result.vehiculos.push({
        numero_movil: numMovil,
        placa_vehiculo: placaReal, // Sin "de BATOR"!
        conductor_nombre: conductorNombre,
        conductor_id: conductorId,
        correria: 'Patrullaje'
      });
    }
  }

  // 9. Narrativa / Observación
  const narrativaExplicitMatch = cleanText.match(/\*(?:NARRATIVA|OBSERVACI[OÓ]N|NOVEDAD(?:ES)?):\*\s*([\s\S]*?)(?=\*(?:ÁREAS|AREAS|EQUIPOS|INFORMA|REPORTA|CORRERÍA|PURSTO|PUESTO):\*|•En el movil|Movil|Unidad|\n-|$)/i);
  if (narrativaExplicitMatch && narrativaExplicitMatch[1].trim().length > 3) {
    result.narrativa = narrativaExplicitMatch[1].trim();
  } else {
    // Generar automáticamente la narrativa operativa a partir del contenido
    const narrativeParts: string[] = [];

    // Detalle de puestos si existen
    if (result.unidades.length > 0) {
      const puestosDesc = result.unidades.map((u: any) => `${u.rol}: ${u.rango} ${u.nombre} (${u.placa_institucional || 'Sin Placa'})`).join(', ');
      narrativeParts.push(`Personal de servicio: ${puestosDesc}.`);
    }

    // Detalle de móviles si existen
    if (result.vehiculos.length > 0) {
      const vehsDesc = result.vehiculos.map((v: any) => v.numero_movil).join(', ');
      narrativeParts.push(`Móviles en operación: ${vehsDesc}.`);
    }

    // Detalle de informe
    if (result.informa.nombre) {
      narrativeParts.push(`Informa a la superioridad: ${result.informa.rango} ${result.informa.nombre}.`);
    }

    narrativeParts.push('Servicio y relevo operativo ejecutado sin novedades de relevancia. Dios, Patria y Honor.');
    result.narrativa = narrativeParts.join(' ');
  }

  // 10. Áreas
  const areasMatch = cleanText.match(/\*(?:ÁREAS|AREAS):\*\s*([\s\S]*?)(?=\*(?:EQUIPOS|NOVEDAD(?:ES)?|INFORMA|REPORTA):\*|•En el movil|Movil|Unidad|$)/i);
  if (areasMatch) {
    let rawAreas = areasMatch[1].trim();
    const cleanAreas = rawAreas.split('\n')
      .filter(a => a.trim().startsWith('-') || a.trim().length > 2)
      .map(a => a.replace(/^-?\s*/, '').trim())
      .join(', ');
    result.areas_recorrido = cleanAreas || rawAreas;
  }

  return result;
}
