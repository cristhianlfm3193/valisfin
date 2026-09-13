import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';

// Usa las variables de entorno locales de .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan credenciales de Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function procesarCSV() {
  const fileStream = fs.createReadStream('./datos_rh.csv', 'utf8');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let successCount = 0;
  let errorCount = 0;

  console.log("🚀 Iniciando actualización masiva en BD-RH...");

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false; // Saltamos el encabezado
      continue;
    }

    if (!line.trim()) continue;

    const parts = line.split(';');
    
    if (parts.length < 5) continue;

    // Posición;Nombre;Apellido;Género;Cédula;Cargo;Código Cargo;Salario;Sobresueldo;Fecha de inicio;Objeto de Gasto;Estado
    const posicion = parts[0]?.trim();
    const nombre = parts[1]?.trim();
    const apellido = parts[2]?.trim();
    const genero = parts[3]?.trim();
    const cedula = parts[4]?.trim();
    const cargo = parts[5]?.trim();
    const codigo_cargo = parts[6]?.trim();
    const salario = parseFloat(parts[7]?.trim() || '0');
    const sobresueldo = parseFloat(parts[8]?.trim() || '0');
    let fecha_inicio = parts[9]?.trim() || null;
    const objeto_gasto = parts[10]?.trim();
    const estado = parts[11]?.trim();

    if (!cedula) continue;
    
    // Normalizar la fecha YYYY-MM-DD
    if (fecha_inicio && !fecha_inicio.match(/^\d{4}-\d{2}-\d{2}$/)) {
        fecha_inicio = null;
    }

    const payload = {
        pos_id: posicion,
        nombre: nombre,
        apellido: apellido,
        nombre_completo: `${nombre} ${apellido}`,
        genero: genero,
        cedula: cedula,
        cargo: cargo,
        rango: cargo, // Guardamos también en rango por compatibilidad
        codigo_cargo: codigo_cargo,
        salario: isNaN(salario) ? 0 : salario,
        sobresueldo: isNaN(sobresueldo) ? 0 : sobresueldo,
        fecha_inicio: fecha_inicio,
        objeto_gasto: objeto_gasto,
        estado: estado
    };

    // Primero verificamos si existe por cédula
    const { data: existingData } = await supabase
        .from('valisan_bdrh')
        .select('id')
        .eq('cedula', cedula)
        .single();

    if (existingData) {
        // Actualizar
        const { error } = await supabase
            .from('valisan_bdrh')
            .update(payload)
            .eq('id', existingData.id);
        
        if (error) {
            console.error(`❌ Error actualizando a ${nombre} (${cedula}):`, error.message);
            errorCount++;
        } else {
            successCount++;
        }
    } else {
        // Crear
        const { error } = await supabase
            .from('valisan_bdrh')
            .insert([payload]);
        
        if (error) {
            console.error(`❌ Error insertando a ${nombre} (${cedula}):`, error.message);
            errorCount++;
        } else {
            successCount++;
        }
    }
  }

  console.log(`\n✅ Proceso completado. Registros exitosos: ${successCount} | Errores: ${errorCount}`);
}

procesarCSV();
