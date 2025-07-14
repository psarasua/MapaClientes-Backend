// Seeder para la tabla camiones
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_us8Q7AjPFHUT@ep-rapid-grass-acjetl0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

export async function seedCamiones() {
  try {
    console.log('🚀 Iniciando seed de camiones...');
    
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
    
    // Verificar los datos insertados
    const result = await pool.query('SELECT * FROM camiones ORDER BY id');
    console.log('📋 Camiones en la base de datos:');
    result.rows.forEach(camion => {
      console.log(`  ${camion.id} - ${camion.descripcion}`);
    });
    
    return result.rows;
  } catch (error) {
    console.error('❌ Error en seed de camiones:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente desde Node.js (no desde Netlify)
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('camionesSeeder.js')) {
  seedCamiones()
    .then(() => {
      console.log('🎉 Seed completado exitosamente');
      pool.end();
    })
    .catch(error => {
      console.error('💥 Error ejecutando seed:', error);
      pool.end();
      process.exit(1);
    });
}