const userText = `*Conductor de AVSEC:*
- *Ixan Barría* 8–946–2084

*Unidad Aeronaval.*
- Cabo1ro 71310 *Luis Charles*

*REPORTA:*
Sargento1ro 80799 *Raúl Hernández*
*Sub-Oficial de turno en el A.I.P.P.*

*DIOS PATRIA Y HONOR*`;

async function test() {
  const res = await fetch('http://localhost:3000/api/parse-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: userText })
  });

  console.log('Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

test();
