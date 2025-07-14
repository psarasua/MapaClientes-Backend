// Seeder para la tabla camiones
import pkg from 'pg';
const { Pool } = pkg;

const defaultPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_us8Q7AjPFHUT@ep-rapid-grass-acjetl0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

export async function seedCamiones(externalPool = null) {
  const pool = externalPool || defaultPool;

  try {
    console.log('🚀 Iniciando seed de camiones...');

    // Limpiar tabla existente
    await pool.query('DELETE FROM camiones');
    console.log('🧹 Tabla camiones limpiada');

    // Reiniciar secuencia
    await pool.query('ALTER SEQUENCE camiones_id_seq RESTART WITH 1');
    console.log('🔄 Secuencia reiniciada');

    const camiones = [
      'Daniel Torres',
      'Alvaro Garcia',
      'Robert Labruna',
      'Jose Luis',
      'Reparto Nuevo'
    ];

    const insertedCamiones = [];

    for (const descripcion of camiones) {
      const result = await pool.query(
        'INSERT INTO camiones (descripcion) VALUES ($1) RETURNING *',
        [descripcion]
      );
      insertedCamiones.push(result.rows[0]);
      console.log(`✅ Camión insertado: ${descripcion}`);
    }

    console.log(`🎉 Seed de camiones completado: ${insertedCamiones.length} registros insertados`);
    return insertedCamiones;
  } catch (error) {
    console.error('❌ Error en seed de camiones:', error);
    throw error;
  } finally {
    // Solo cerrar el pool si no es externo
    if (!externalPool) {
      await pool.end();
    }
  }
}

// Ejecutar si se llama directamente desde Node.js (no desde Netlify)
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('camionesSeeder.js')) {
  seedCamiones()
    .then(() => {
      console.log('🎉 Seed completado exitosamente');
      defaultPool.end();
    })
    .catch(error => {
      console.error('💥 Error ejecutando seed:', error);
      defaultPool.end();
      process.exit(1);
    });
}