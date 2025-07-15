// seeders/diasEntregaSeeder.js
// Seeder para la tabla dias_entrega

import pool from '../config/database.js';

// Datos de días de entrega
const diasEntregaData = [
  { id: 1, descripcion: 'Lunes' },
  { id: 2, descripcion: 'Martes' },
  { id: 3, descripcion: 'Miércoles' },
  { id: 4, descripcion: 'Jueves' },
  { id: 5, descripcion: 'Viernes' },
];

export async function seedDiasEntrega(externalPool = null) {
  const dbPool = externalPool || pool;

  try {
    console.log('🗓️ Iniciando seeder de días de entrega...');

    // Limpiar tabla existente
    await dbPool.query('DELETE FROM dias_entrega');
    console.log('🧹 Tabla dias_entrega limpiada');

    // Reiniciar secuencia
    await dbPool.query('ALTER SEQUENCE dias_entrega_id_seq RESTART WITH 1');
    console.log('🔄 Secuencia reiniciada');

    // Insertar datos
    const insertedDias = [];

    for (const dia of diasEntregaData) {
      const query = `
        INSERT INTO dias_entrega (id, descripcion)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET descripcion = $2
        RETURNING *
      `;

      const result = await dbPool.query(query, [dia.id, dia.descripcion]);
      insertedDias.push(result.rows[0]);
      console.log(`✅ Día insertado: ${dia.descripcion}`);
    }

    // Actualizar secuencia para que siguiente ID sea correcto
    await dbPool.query('SELECT setval(\'dias_entrega_id_seq\', (SELECT MAX(id) FROM dias_entrega))');
    console.log('🔄 Secuencia actualizada');

    console.log(`🎉 Seeder completado: ${insertedDias.length} días de entrega insertados`);
    return insertedDias;

  } catch (error) {
    console.error('❌ Error en seeder de días de entrega:', error);
    throw error;
  } finally {
    // Solo cerrar el pool si no es externo
    if (!externalPool) {
      // No cerramos el pool importado
    }
  }
}

// Ejecutar si se llama directamente desde Node.js
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('diasEntregaSeeder.js')) {
  seedDiasEntrega()
    .then((result) => {
      console.log('🎉 Seeding de días de entrega completado:', result.length, 'registros');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error en seeding de días de entrega:', error);
      process.exit(1);
    });
}
