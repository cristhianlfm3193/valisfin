const sampleText = `*Correría:* Sgto. 2do. 81320 Fernando Melgar

*Pursto la Retractil:*
Guardia 83404 Irving Barba
Guardia 72213 Stephan Pitti

*Informa:*
Sgto. 2do. 81320 Fernando Melgar
*Técnico de Mantenimiento Aéreo de Ala Rotatoria*

PA *Dios, Patria y Honor* PA`;

async function test() {
  const res = await fetch('http://localhost:3000/api/parse-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: sampleText })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

test();
