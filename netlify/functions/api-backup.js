// netlify/functions/api.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import pkg from 'pg';
import { initializeDatabase, checkTableExists, getDatabaseInfo } from '../../config/dbInit.js';

// Cargar variables de entorno en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  try {
    import('dotenv').then(dotenv => {
      dotenv.config();
    }).catch(() => {
      console.log('dotenv no disponible, usando variables de entorno del sistema');
    });
  } catch (error) {
    console.log('dotenv no disponible, usando variables de entorno del sistema');
  }
}

const { Pool } = pkg;

// Validación de variables de entorno críticas
const validateEnvironmentVariables = () => {
  const requiredVars = ['DATABASE_URL'];
  const missingVars = [];
  const warnings = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Verificar si DATABASE_URL está definida
  if (!process.env.DATABASE_URL) {
    warnings.push('⚠️ DATABASE_URL no está definida, usando cadena de conexión por defecto');
    warnings.push('📋 Para producción, configura DATABASE_URL en las variables de entorno');
  } else {
    console.log('✅ DATABASE_URL configurada correctamente');
  }

  // Mostrar warnings
  if (warnings.length > 0) {
    console.log('\n🔔 AVISOS DE CONFIGURACIÓN:');
    warnings.forEach(warning => console.log(warning));
    console.log('');
  }

  return {
    hasErrors: missingVars.length > 0,
    missingVars,
    warnings
  };
};

// Ejecutar validación
const envValidation = validateEnvironmentVariables();

// Configuración de la base de datos usando variables de entorno
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
let dbInitError = null;

const initDB = async () => {
  if (!dbInitialized) {
    try {
      console.log('🚀 Iniciando verificación de base de datos...');
      console.log('🔗 DATABASE_URL configurada:', process.env.DATABASE_URL ? 'Sí' : 'No (usando fallback)');
      console.log('🔗 String de conexión:', process.env.DATABASE_URL ? '[CONFIGURADO]' : '[USANDO FALLBACK]');
      
      // Verificar conexión primero
      console.log('⏳ Intentando conectar a PostgreSQL...');
      const client = await pool.connect();
      console.log('✅ Conexión a PostgreSQL establecida');
      client.release();
      
      // Inicializar tablas
      console.log('⏳ Iniciando creación/verificación de tablas...');
      await initializeDatabase(pool);
      
      dbInitialized = true;
      dbInitError = null;
      console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando la base de datos:', error);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error details:', error.detail);
      dbInitError = error;
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

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
  successResponse(res, { message: 'API funcionando correctamente' }, 'Test exitoso');
});

// RUTA PING - Health check con información de base de datos
app.get('/api/ping', async (req, res) => {
  try {
    const dbStart = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    const dbTime = Date.now() - dbStart;
    
    const response = {
      status: 'ok',
      environment: process.env.NODE_ENV || 'production',
      server: 'Netlify Functions',
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
      environment: process.env.NODE_ENV || 'production',
      server: 'Netlify Functions',
      message: 'API funcionando con problemas de BD',
      database: {
        status: 'disconnected',
        error: error.message
      }
    };

    successResponse(res, response, '⚠️ API funcionando pero BD desconectada');
  }
});

// Middleware de manejo de rutas no encontradas
app.use((req, res) => {
  errorResponse(res, `La ruta ${req.originalUrl} no existe`, 404);
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  errorResponse(res, 'Error interno del servidor', 500, process.env.NODE_ENV === 'production' ? 'Algo salió mal' : err.message);
});

export const handler = serverless(app);
