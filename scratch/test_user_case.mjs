const text = `*Conductor de AVSEC:*
- *Ixan Barría* 8–946–2084

*Unidad Aeronaval.*
- Cabo1ro 71310 *Luis Charles*

*REPORTA:*
Sargento1ro 80799 *Raúl Hernández*
*Sub-Oficial de turno en el A.I.P.P.*

*DIOS PATRIA Y HONOR*`;

// Let's test our normalized parsing
const cleanText = text
  .replace(/[\u2010-\u2015\u2212]/g, '-')
  .replace(/\r\n/g, '\n');

console.log('Clean text:\n', cleanText);

const rangosRegexStr = 'Comisionada|Comisionado|Subcomisionada|Subcomisionado|Mayor|Capitán|Capitan|Teniente|Subteniente|Sargento1ro|Sargento2do|Sgto1ro|Sgto2do|Sgto\\.?\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Sargento\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Cabo1ro|Cabo2do|Cabo\\s*(?:1ro\\.?|2do\\.?|1°|2°)?|Inspector(?:a)?|Guardia|Agente';

function normalizeRank(r) {
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
  if (clean.includes('comisionad')) return clean.includes('sub') ? 'Subcomisionado' : 'Comisionado';
  if (clean.includes('subteniente')) return 'Subteniente';
  if (clean.includes('teniente')) return 'Teniente';
  if (clean.includes('mayor')) return 'Mayor';
  if (clean.includes('capit')) return 'Capitán';
  if (clean.includes('inspector')) return 'Inspector';
  if (clean.includes('guardia')) return 'Guardia';
  return r.trim();
}

function extractOfficer(line) {
  if (!line) return null;
  const cleanLine = line.replace(/[*_~•-]/g, '').trim();

  // Patrón 1: [Rango] [Placa (4-6 dígitos)] [Nombre]
  const p1 = new RegExp(`^(${rangosRegexStr})\\s+(\\d{4,6})\\s+([A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+)$`, 'i');
  const m1 = cleanLine.match(p1);
  if (m1) {
    return {
      rango: normalizeRank(m1[1]),
      placa: m1[2].trim(),
      nombre: m1[3].trim()
    };
  }

  // Patrón 2: [Nombre] [Cédula o Placa] (ej: Ixan Barría 8-946-2084)
  const p2 = /^([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+?)\s+([\d-]{5,15})$/i;
  const m2 = cleanLine.match(p2);
  if (m2 && m2[1].trim().length > 3) {
    return {
      rango: 'Conductor / Agente',
      placa: m2[2].trim(),
      nombre: m2[1].trim()
    };
  }

  return null;
}

console.log('Officer 1 (Cabo1ro):', extractOfficer('- Cabo1ro 71310 *Luis Charles*'));
console.log('Officer 2 (REPORTA):', extractOfficer('Sargento1ro 80799 *Raúl Hernández*'));
console.log('Officer 3 (Conductor):', extractOfficer('- *Ixan Barría* 8-946-2084'));
