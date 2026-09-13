import { parseReportText } from './test_enhanced_parser.mjs';

const sampleText1 = `*Correría:* Sgto. 2do. 81320 Fernando Melgar

*Pursto la Retractil:*
Guardia 83404 Irving Barba
Guardia 72213 Stephan Pitti

*Informa:*
Sgto. 2do. 81320 Fernando Melgar
*Técnico de Mantenimiento Aéreo de Ala Rotatoria*

PA *Dios, Patria y Honor* PA`;

console.log('--- TEST 1 (User WhatsApp text) ---');
console.log(JSON.stringify(parseReportText(sampleText1), null, 2));

const sampleText2 = `*DINOA/POLICÍA AEROPORTUARIA*
*FECHA:* 13/09/2026
*HORA:* 11:30
*REPORTE:* Recorrido Perimetral
• En el movil 1064 de BATOR conducido por Guardia 83404 Irving Barba
• Movil 95 EN5327
*NARRATIVA:* Se realiza patrullaje sin novedades.
*ÁREAS:*
- Pista antigua
- Portón 5
*Informa:* Teniente 72213 Stephan Pitti`;

console.log('--- TEST 2 (Vehicles with de BATOR) ---');
console.log(JSON.stringify(parseReportText(sampleText2), null, 2));
