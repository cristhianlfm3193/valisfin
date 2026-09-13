import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ found: false, results: [] });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Configuración de base de datos no disponible' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Si es un número (pos_id o placa institucional), buscar primero exacto
    if (/^\d{3,7}$/.test(query)) {
      const { data: exactPlaca } = await supabase
        .from('valisan_bdrh')
        .select('id, pos_id, rango, cargo, nombre_completo, cedula, base, departamento')
        .eq('pos_id', query)
        .limit(1);

      if (exactPlaca && exactPlaca.length > 0) {
        const p = exactPlaca[0];
        return NextResponse.json({
          found: true,
          persona: {
            pos_id: p.pos_id,
            rango: p.rango || p.cargo || 'Guardia',
            nombre_completo: p.nombre_completo?.replace(/\s+/g, ' ').trim(),
            cedula: p.cedula,
            base: p.base,
            departamento: p.departamento
          },
          results: exactPlaca
        });
      }
    }

    // Si tiene formato de cédula (ej. 8-986-1812 o PE-10-2243)
    if (/[\d-]{4,}/.test(query)) {
      const { data: exactCedula } = await supabase
        .from('valisan_bdrh')
        .select('id, pos_id, rango, cargo, nombre_completo, cedula, base, departamento')
        .ilike('cedula', `${query}%`)
        .limit(1);

      if (exactCedula && exactCedula.length > 0) {
        const p = exactCedula[0];
        return NextResponse.json({
          found: true,
          persona: {
            pos_id: p.pos_id,
            rango: p.rango || p.cargo || 'Guardia',
            nombre_completo: p.nombre_completo?.replace(/\s+/g, ' ').trim(),
            cedula: p.cedula,
            base: p.base,
            departamento: p.departamento
          },
          results: exactCedula
        });
      }
    }

    // Búsqueda por nombre parcial
    const { data: nameMatches } = await supabase
      .from('valisan_bdrh')
      .select('id, pos_id, rango, cargo, nombre_completo, cedula, base, departamento')
      .ilike('nombre_completo', `%${query}%`)
      .limit(5);

    if (nameMatches && nameMatches.length > 0) {
      const p = nameMatches[0];
      return NextResponse.json({
        found: true,
        persona: {
          pos_id: p.pos_id,
          rango: p.rango || p.cargo || 'Guardia',
          nombre_completo: p.nombre_completo,
          cedula: p.cedula,
          base: p.base,
          departamento: p.departamento
        },
        results: nameMatches
      });
    }

    return NextResponse.json({ found: false, results: [] });

  } catch (error: any) {
    console.error('Error en lookup BD-RH:', error);
    return NextResponse.json({ error: error.message || 'Error en búsqueda' }, { status: 500 });
  }
}
