import { NextResponse } from 'next/server';
import { parseReportText } from '@/lib/report-parser';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Falta el texto del reporte' }, { status: 400 });
    }

    // 1. Extraer los datos del texto estructurado
    const parsedData = parseReportText(text);

    // 2. Conectar con Supabase para enriquecer con BD-RH institucional
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Recolectar todas las placas / pos_id presentes en el reporte
      const placasSet = new Set<string>();
      const nombresSet = new Set<string>();

      const addPerson = (person: any) => {
        if (person?.placa && person.placa.length >= 3) {
          placasSet.add(person.placa.trim());
        } else if (person?.nombre && person.nombre.length >= 4) {
          // Si no tiene placa, extraemos el apellido o el nombre base
          const parts = person.nombre.trim().split(' ');
          const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
          nombresSet.add(lastName);
        }
      };

      addPerson(parsedData.reporta);
      addPerson(parsedData.informa);

      const placas = Array.from(placasSet);
      const nombres = Array.from(nombresSet);

      if (placas.length > 0 || nombres.length > 0) {
        // Construir query `or`
        let orQueries = [];
        if (placas.length > 0) {
          orQueries.push(`pos_id.in.(${placas.map(p => `"${p}"`).join(',')})`);
          orQueries.push(`cedula.in.(${placas.map(p => `"${p}"`).join(',')})`);
        }
        if (nombres.length > 0) {
          nombres.forEach(n => {
            orQueries.push(`nombre_completo.ilike.%${n}%`);
            orQueries.push(`apellido.ilike.%${n}%`);
          });
        }

        const { data: oficiales, error } = await supabase
          .from('valisan_bdrh')
          .select('pos_id, rango, cargo, nombre_completo, nombre, apellido, cedula, base, departamento')
          .or(orQueries.join(','));

        if (!error && oficiales && oficiales.length > 0) {
          const oficialesMap = new Map<string, any>();
          oficiales.forEach((o: any) => {
            if (o.pos_id) oficialesMap.set(o.pos_id.trim(), o);
            if (o.cedula) oficialesMap.set(o.cedula.trim(), o);
          });

          // Enriquecer Reporta
          if (parsedData.reporta?.placa && oficialesMap.has(parsedData.reporta.placa)) {
            const o = oficialesMap.get(parsedData.reporta.placa);
            parsedData.reporta.nombre = o.nombre_completo?.replace(/\s+/g, ' ').trim() || parsedData.reporta.nombre;
            parsedData.reporta.rango = o.rango || o.cargo || parsedData.reporta.rango;
            parsedData.reporta.cedula = o.cedula;
            parsedData.reporta.verificado_bdrh = true;
          }

          // Enriquecer Informa
          if (parsedData.informa?.placa && oficialesMap.has(parsedData.informa.placa)) {
            const o = oficialesMap.get(parsedData.informa.placa);
            parsedData.informa.nombre = o.nombre_completo?.replace(/\s+/g, ' ').trim() || parsedData.informa.nombre;
            parsedData.informa.rango = o.rango || o.cargo || parsedData.informa.rango;
            parsedData.informa.cedula = o.cedula;
            parsedData.informa.verificado_bdrh = true;
          }

        }
      }
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error parsing report with BD-RH enrichment:', error);
    return NextResponse.json({ error: error.message || 'Error procesando el reporte' }, { status: 500 });
  }
}
