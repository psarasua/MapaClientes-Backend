// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import { initializeDatabase, checkTableExists, getDatabaseInfo } from './config/dbInit.js';

// Cargar variables de entorno
dotenv.config();

const { Pool } = pkg;

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_us8Q7AjPFHUT@ep-rapid-grass-acjetl0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de conexión inicial
pool.on('connect', () => {
  console.log('🔗 Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL', err);
});

// Inicialización de la base de datos
let dbInitialized = false;

const initDB = async () => {
  if (!dbInitialized) {
    try {
      console.log('🚀 Iniciando verificación de base de datos...');
      await initializeDatabase(pool);
      dbInitialized = true;
      console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando la base de datos:', error);
      // No bloqueamos la aplicación, pero registramos el error
    }
  }
};

// Inicializar la base de datos al arrancar
initDB();

const app = express();

// Middlewares de seguridad y configuración
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Funciones de respuesta
const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const errorResponse = (res, message = 'Error en la operación', statusCode = 400, error = null) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details: error,
    timestamp: new Date().toISOString()
  });
};

// Ruta principal con información de la API
app.get('/api', (req, res) => {
  const apiInfo = {
    name: 'MapaClientes API',
    version: '1.0.0',
    description: 'API robusta para gestión de clientes con geolocalización',
    environment: process.env.NODE_ENV || 'development',
    database: {
      initialized: dbInitialized,
      autoInit: true
    },
    endpoints: {
      ping: '/api/ping',
      health: '/api/health',
      database: {
        info: '/api/database',
        reinit: '/api/database/reinit (POST)'
      },
      clientes: {
        base: '/api/clientes',
        methods: ['GET', 'POST'],
        byId: '/api/clientes/:id',
        methodsById: ['GET', 'PUT', 'PATCH', 'DELETE'],
        ubicacion: '/api/clientes/:id/ubicacion'
      }
    }
  };

  successResponse(res, apiInfo, '🚀 API MapaClientes funcionando correctamente');
});

// RUTA PING - Health check con información de base de datos
app.get('/api/ping', async (req, res) => {
  try {
    const dbStart = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    const dbTime = Date.now() - dbStart;
    
    const response = {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      server: 'Express Local',
      message: 'API funcionando correctamente',
      database: {
        status: 'connected',
        responseTime: `${dbTime}ms`,
        serverTime: result.rows[0].current_time,
        version: result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1]
      }
    };

    successResponse(res, response, '🏓 Pong! Sistema operativo');
  } catch (error) {
    console.error('❌ Error en ping:', error);
    
    const response = {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      server: 'Express Local',
      message: 'API funcionando con problemas de BD',
      database: {
        status: 'disconnected',
        error: error.message
      }
    };

    successResponse(res, response, '⚠️ API funcionando pero BD desconectada');
  }
});

// RUTA DATABASE INFO - Información detallada de la base de datos
app.get('/api/database', async (req, res) => {
  try {
    // Verificar si la base de datos está inicializada
    if (!dbInitialized) {
      return errorResponse(res, 'Base de datos no inicializada', 503);
    }

    const dbInfo = await getDatabaseInfo(pool);
    
    // Organizar la información por tablas
    const tables = {};
    dbInfo.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = {
          name: row.table_name,
          type: row.table_type,
          columns: []
        };
      }
      if (row.column_name) {
        tables[row.table_name].columns.push({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          default: row.column_default
        });
      }
    });

    const response = {
      initialized: dbInitialized,
      tables: Object.values(tables),
      tableCount: Object.keys(tables).length,
      timestamp: new Date().toISOString()
    };

    successResponse(res, response, '📊 Información de base de datos obtenida correctamente');
  } catch (error) {
    console.error('❌ Error obteniendo información de BD:', error);
    errorResponse(res, 'Error obteniendo información de la base de datos', 500, error.message);
  }
});

// RUTA DATABASE REINIT - Reinicializar la base de datos
app.post('/api/database/reinit', async (req, res) => {
  try {
    console.log('🔄 Reinicializando base de datos...');
    dbInitialized = false;
    await initializeDatabase(pool);
    dbInitialized = true;
    
    successResponse(res, { initialized: true }, '✅ Base de datos reinicializada correctamente');
  } catch (error) {
    console.error('❌ Error reinicializando BD:', error);
    errorResponse(res, 'Error reinicializando la base de datos', 500, error.message);
  }
});

// Importar y usar las rutas existentes
// Aquí deberías importar tus rutas de clientes cuando las tengas

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🏓 Health check en http://localhost:${PORT}/api/ping`);
  console.log(`📊 Database info en http://localhost:${PORT}/api/database`);
});

export default app;
