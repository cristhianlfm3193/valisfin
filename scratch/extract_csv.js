const fs = require('fs');

const transcriptPath = 'C:\\Users\\crist\\.gemini\\antigravity-ide\\brain\\a6499489-f64f-494d-81fd-4887084a4a0a\\.system_generated\\logs\\transcript_full.jsonl';
const outputPath = 'C:\\Users\\crist\\OneDrive\\Desktop\\ValisFin\\valisan_bdrh.sql';

const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');

let rawCsvData = '';

for (let i = lines.length - 1; i >= 0; i--) {
  try {
    const step = JSON.parse(lines[i]);
    if (step.type === 'USER_INPUT' && step.content && step.content.includes(';Rango;')) {
      const contentLines = step.content.split('\n');
      const headerIndex = contentLines.findIndex(l => l.startsWith('#;Posici'));
      if (headerIndex !== -1) {
        rawCsvData = contentLines.slice(headerIndex + 1).join('\n');
        break;
      }
    }
  } catch(e){}
}

if (!rawCsvData) {
  console.log("Still not found!");
  process.exit(1);
}

// Clean up literal \n if they exist
rawCsvData = rawCsvData.replace(/\\n/g, '\n').replace(/\\r/g, '');

const csvLines = rawCsvData.split('\n');

let sql = `
-- Create Table valisan_bdrh
CREATE TABLE IF NOT EXISTS valisan_bdrh (
    id SERIAL PRIMARY KEY,
    pos_id VARCHAR(50),
    rango VARCHAR(100),
    nombre_completo VARCHAR(255),
    cedula VARCHAR(50),
    grupo_pd VARCHAR(100),
    turno VARCHAR(100),
    base VARCHAR(255),
    direccion VARCHAR(255),
    jef VARCHAR(100),
    departamento VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Data
`;

let values = [];
let validLines = 0;

for (let i = 0; i < csvLines.length; i++) {
  const line = csvLines[i].trim();
  if (!line || !line.includes(';')) continue;
  
  const parts = line.split(';');
  if (parts.length < 5) continue;

  const posId = (parts[1] || '').replace(/'/g, "''");
  const rango = (parts[2] || '').replace(/'/g, "''");
  const nombre = (parts[3] || '').replace(/'/g, "''");
  const cedula = (parts[4] || '').replace(/'/g, "''");
  const grupo = (parts[5] || '').replace(/'/g, "''");
  const turno = (parts[6] || '').replace(/'/g, "''");
  const base = (parts[7] || '').replace(/'/g, "''");
  const direccion = (parts[8] || '').replace(/'/g, "''");
  const jef = (parts[9] || '').replace(/'/g, "''");
  const departamento = (parts[10] || '').replace(/'/g, "''");

  values.push(`('${posId}', '${rango}', '${nombre}', '${cedula}', '${grupo}', '${turno}', '${base}', '${direccion}', '${jef}', '${departamento}')`);
  validLines++;

  if (values.length >= 1000 || i === csvLines.length - 1) {
    if (values.length > 0) {
      sql += `INSERT INTO valisan_bdrh (pos_id, rango, nombre_completo, cedula, grupo_pd, turno, base, direccion, jef, departamento) VALUES\n`;
      sql += values.join(',\n') + ';\n\n';
      values = [];
    }
  }
}

fs.writeFileSync(outputPath, sql);
console.log('Success! Processed ' + validLines + ' rows.');
