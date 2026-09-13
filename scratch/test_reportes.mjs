import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  console.log("Probando inserción de un reporte de prueba...");
  
  const { data: reporteData, error: reporteError } = await supabase
    .from('reportes')
    .insert([{
      departamento: 'TEST_DEPT',
      asunto: 'Test Asunto',
      narrativa: 'Esto es una prueba del sistema automatizado.',
      reporta_nombre: 'Agente Prueba'
    }])
    .select()
    .single();

  if (reporteError) {
    console.error("Error insertando reporte:", reporteError);
    return;
  }
  
  console.log("Reporte insertado exitosamente con ID:", reporteData.id);
  
  const { error: unidadError } = await supabase
    .from('reporte_unidades')
    .insert([{
      reporte_id: reporteData.id,
      nombre: 'Unidad Prueba',
      rol: 'Prueba'
    }]);
    
  if (unidadError) {
    console.error("Error insertando unidad:", unidadError);
  } else {
    console.log("Unidad insertada exitosamente.");
  }
  
  console.log("Prueba finalizada. Eliminando datos de prueba...");
  
  await supabase.from('reportes').delete().eq('id', reporteData.id);
  console.log("Limpieza terminada.");
}

testInsert();
