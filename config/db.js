// config/db.js
// Configuración centralizada de la conexión a la base de datos PostgreSQL usando variables de entorno.
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;
