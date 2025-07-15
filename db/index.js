import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
import * as schema from './schema.js';

const { Pool } = pkg;

// Configuración optimizada del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de conexiones
  idleTimeoutMillis: 30000, // Timeout de conexiones inactivas
  connectionTimeoutMillis: 2000, // Timeout de conexión
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Crear instancia de Drizzle con esquema
export const db = drizzle(pool, { schema });

// Función para inicializar y migrar la base de datos
export async function initializeDatabase() {
  try {
    console.log('🔄 Iniciando migración de base de datos...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  }
}

// Función para cerrar conexiones
export async function closeDatabase() {
  await pool.end();
}

export { pool };
