// config/db.js
// Configuración centralizada de la conexión a la base de datos PostgreSQL usando variables de entorno.
import pkg from 'pg';
const { Pool } = pkg;

// Función para verificar si hay configuración de BD
export const isDatabaseConfigured = () => {
  return !!process.env.DATABASE_URL;
};

// Función para obtener mensaje de error estándar
export const getDatabaseErrorMessage = () => {
  return {
    error: {
      code: 503,
      message: "No hay conexión a la base de datos",
      details: "La base de datos no está configurada. Configura la variable de entorno DATABASE_URL en Netlify.",
      documentation: "Consulta la documentación en /api/docs para más información"
    }
  };
};

// Configuración del pool solo si hay DATABASE_URL
let pool = null;

if (isDatabaseConfigured()) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1, // Límite para serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  // Manejar errores de conexión
  pool.on('error', (err) => {
    console.error('Error en el pool de conexiones:', err);
  });
}

export default pool;
