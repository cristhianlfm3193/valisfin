const fs = require('fs');

const transcriptPath = 'C:\\Users\\crist\\.gemini\\antigravity-ide\\brain\\a6499489-f64f-494d-81fd-4887084a4a0a\\.system_generated\\logs\\transcript_full.jsonl';
const outputPath = 'C:\\Users\\crist\\OneDrive\\Desktop\\ValisFin\\app\\valisan\\components\\bdrh_data.json';

const lines = fs.readFileSync(transcriptPath, 'utf-8').split('\n');
let rawCsvData = '';

for (const line of lines) {
  if (line.includes('5212;83284;')) {
    try {
      const step = JSON.parse(line);
      const content = step.thinking || step.content || '';
      
      const match = content.match(/#;Posici[^\n]+?\\n([\s\S]+?5212;83284[^\n]*)/) || content.match(/#;Posici[^\n]+?\n([\s\S]+?5212;83284[^\n]*)/);
      if (match) {
        rawCsvData = match[1];
        break;
      }
    } catch(e) {}
  }
}

if (!rawCsvData) {
  console.log('Failed to extract CSV data');
  process.exit(1);
}

rawCsvData = rawCsvData.replace(/\\n/g, '\n').replace(/\\r/g, '');
const csvLines = rawCsvData.split('\n');

const jsonData = [];

for (const line of csvLines) {
  const t = line.trim();
  if (!t || !t.includes(';')) continue;
  
  const parts = t.split(';');
  if (parts.length < 5) continue;

  jsonData.push({
    id: parts[0],
    pos: parts[1],
    rango: parts[2],
    nombre: parts[3],
    cedula: parts[4],
    grupo: parts[5],
    turno: parts[6],
    base: parts[7],
    direccion: parts[8],
    jef: parts[9],
    depto: parts[10]
  });
}

fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
console.log('Successfully wrote ' + jsonData.length + ' records to JSON!');
