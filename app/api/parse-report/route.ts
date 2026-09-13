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
      if (parsedData.reporta?.placa) placasSet.add(parsedData.reporta.placa.trim());
      if (parsedData.informa?.placa) placasSet.add(parsedData.informa.placa.trim());
      
      parsedData.unidades?.forEach((u: any) => {
        if (u.placa_institucional) placasSet.add(u.placa_institucional.trim());
      });

      parsedData.vehiculos?.forEach((v: any) => {
        if (v.conductor_id) placasSet.add(v.conductor_id.trim());
      });

      const placas = Array.from(placasSet).filter(p => p.length >= 3);

      if (placas.length > 0) {
        // Consultar por pos_id (placa institucional) o por cedula
        const { data: oficiales, error } = await supabase
          .from('valisan_bdrh')
          .select('pos_id, rango, cargo, nombre_completo, nombre, apellido, cedula, base, departamento')
          .or(`pos_id.in.(${placas.map(p => `"${p}"`).join(',')}),cedula.in.(${placas.map(p => `"${p}"`).join(',')})`);

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

          // Enriquecer Unidades
          parsedData.unidades = parsedData.unidades.map((u: any) => {
            if (u.placa_institucional && oficialesMap.has(u.placa_institucional)) {
              const o = oficialesMap.get(u.placa_institucional);
              return {
                ...u,
                rango: o.rango || o.cargo || u.rango,
                nombre: o.nombre_completo?.replace(/\s+/g, ' ').trim() || u.nombre,
                cedula: o.cedula,
                verificado_bdrh: true
              };
            }
            return u;
          });

          // Enriquecer Vehículos / Conductor
          parsedData.vehiculos = parsedData.vehiculos.map((v: any) => {
            if (v.conductor_id && oficialesMap.has(v.conductor_id)) {
              const o = oficialesMap.get(v.conductor_id);
              return {
                ...v,
                conductor_nombre: o.nombre_completo?.replace(/\s+/g, ' ').trim() || v.conductor_nombre,
                conductor_id: o.cedula || o.pos_id,
                verificado_bdrh: true
              };
            }
            return v;
          });
        }
      }
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error parsing report with BD-RH enrichment:', error);
    return NextResponse.json({ error: error.message || 'Error procesando el reporte' }, { status: 500 });
  }
}
