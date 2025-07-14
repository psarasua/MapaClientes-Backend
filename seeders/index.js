// seeders/index.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const getCurrentDir = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      const __filename = fileURLToPath(import.meta.url);
      return path.dirname(__filename);
    }
  } catch (error) {
    // Silenciar el error y usar fallback
  }
  return process.cwd();
};

const currentDir = getCurrentDir();

/**
 * Ejecuta todos los seeders automáticamente
 * @param {Pool} pool - Pool de conexiones de PostgreSQL
 */
export const runAllSeeders = async (pool) => {
  try {
    console.log('🌱 Iniciando seeders automáticos...');
    
    // Ejecutar seeders en orden (respetando dependencias)
    await seedDiasEntrega(pool);
    await seedCamiones(pool);
    await seedCamionesDias(pool);
    // Omitir seedCore ya que la tabla core está vacía
    
    console.log('✅ Todos los seeders ejecutados exitosamente');
    
    return {
      success: true,
      message: 'Seeders ejecutados correctamente'
    };
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    throw error;
  }
};

/**
 * Verifica si una tabla tiene datos
 * @param {Pool} pool - Pool de conexiones
 * @param {string} tableName - Nombre de la tabla
 * @returns {boolean} - True si la tabla tiene datos
 */
const hasData = async (pool, tableName) => {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error(`Error verificando datos en tabla ${tableName}:`, error);
    return false;
  }
};

/**
 * Seeder para dias_entrega
 */
const seedDiasEntrega = async (pool) => {
  try {
    if (await hasData(pool, 'dias_entrega')) {
      console.log('📋 Tabla dias_entrega ya tiene datos, omitiendo seed...');
      return;
    }
    
    console.log('🌱 Seeding dias_entrega...');
    
    const dias = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo'
    ];
    
    for (const descripcion of dias) {
      await pool.query(
        'INSERT INTO dias_entrega (descripcion) VALUES ($1) ON CONFLICT DO NOTHING',
        [descripcion]
      );
    }
    
    console.log('✅ Seed de dias_entrega completado');
  } catch (error) {
    console.error('❌ Error en seed de dias_entrega:', error);
    throw error;
  }
};

/**
 * Seeder para camiones
 */
const seedCamiones = async (pool) => {
  try {
    if (await hasData(pool, 'camiones')) {
      console.log('📋 Tabla camiones ya tiene datos, omitiendo seed...');
      return;
    }
    
    console.log('🌱 Seeding camiones...');
    
    const camiones = [
      'Daniel Torres',
      'Alvaro Garcia',
      'Robert Labruna',
      'Jose Luis',
      'Reparto Nuevo'
    ];
    
    for (const descripcion of camiones) {
      await pool.query(
        'INSERT INTO camiones (descripcion) VALUES ($1) ON CONFLICT DO NOTHING',
        [descripcion]
      );
    }
    
    console.log('✅ Seed de camiones completado');
  } catch (error) {
    console.error('❌ Error en seed de camiones:', error);
    throw error;
  }
};

/**
 * Seeder para camiones_dias
 */
const seedCamionesDias = async (pool) => {
  try {
    if (await hasData(pool, 'camiones_dias')) {
      console.log('📋 Tabla camiones_dias ya tiene datos, omitiendo seed...');
      return;
    }
    
    console.log('🌱 Seeding camiones_dias...');
    
    // Obtener IDs de camiones y días
    const camionesResult = await pool.query('SELECT id FROM camiones ORDER BY id');
    const diasResult = await pool.query('SELECT id FROM dias_entrega ORDER BY id');
    
    if (camionesResult.rows.length === 0 || diasResult.rows.length === 0) {
      console.log('⚠️  No hay camiones o días disponibles para asignar');
      return;
    }
    
    // Asignar días a camiones (ejemplo: cada camión trabaja algunos días)
    const asignaciones = [
      { camion_id: 1, dia_entrega_id: 1 }, // Daniel Torres - Lunes
      { camion_id: 1, dia_entrega_id: 2 }, // Daniel Torres - Martes
      { camion_id: 2, dia_entrega_id: 3 }, // Alvaro Garcia - Miércoles
      { camion_id: 2, dia_entrega_id: 4 }, // Alvaro Garcia - Jueves
      { camion_id: 3, dia_entrega_id: 5 }, // Robert Labruna - Viernes
      { camion_id: 4, dia_entrega_id: 6 }, // Jose Luis - Sábado
      { camion_id: 5, dia_entrega_id: 1 }, // Reparto Nuevo - Lunes
      { camion_id: 5, dia_entrega_id: 5 }, // Reparto Nuevo - Viernes
    ];
    
    for (const asignacion of asignaciones) {
      // Verificar que los IDs existen antes de insertar
      if (asignacion.camion_id <= camionesResult.rows.length && 
          asignacion.dia_entrega_id <= diasResult.rows.length) {
        await pool.query(
          'INSERT INTO camiones_dias (camion_id, dia_entrega_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [asignacion.camion_id, asignacion.dia_entrega_id]
        );
      }
    }
    
    console.log('✅ Seed de camiones_dias completado');
  } catch (error) {
    console.error('❌ Error en seed de camiones_dias:', error);
    // No lanzar error si las tablas relacionadas no existen aún
  }
};

/**
 * Seeder para core (omitido por ahora ya que la tabla está vacía)
 */
const seedCore = async (pool) => {
  try {
    console.log('⚠️  Tabla core no tiene estructura definida, omitiendo seed...');
    return;
  } catch (error) {
    console.error('❌ Error en seed de core:', error);
    throw error;
  }
};
