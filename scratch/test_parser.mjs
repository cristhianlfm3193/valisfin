import { parseReportText } from '../lib/report-parser.ts';

const sampleText = `*Correría:* Sgto. 2do. 81320 Fernando Melgar

*Pursto la Retractil:*
Guardia 83404 Irving Barba
Guardia 72213 Stephan Pitti

*Informa:*
Sgto. 2do. 81320 Fernando Melgar
*Técnico de Mantenimiento Aéreo de Ala Rotatoria*

PA *Dios, Patria y Honor* PA`;

console.log(JSON.stringify(parseReportText(sampleText), null, 2));
