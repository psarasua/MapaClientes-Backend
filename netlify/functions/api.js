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

// Ruta raíz - Página de bienvenida con índice de la API
app.get('/', async (req, res) => {
  try {
    // Verificar estado de la base de datos
    let dbStatus = '🔴 Desconectada';
    let dbDetails = '';
    let dbInitStatus = '🔴 No inicializada';
    
    try {
      const dbStart = Date.now();
      await pool.query('SELECT 1');
      const dbTime = Date.now() - dbStart;
      dbStatus = '🟢 Conectada';
      dbDetails = `(${dbTime}ms)`;
    } catch (error) {
      dbStatus = '🔴 Error de conexión';
      dbDetails = `(${error.message})`;
    }
    
    if (dbInitialized) {
      dbInitStatus = '🟢 Inicializada correctamente';
    } else if (dbInitError) {
      dbInitStatus = `🔴 Error: ${dbInitError.message}`;
    }
    
    // Verificar variables de entorno
    const envStatus = {
      DATABASE_URL: process.env.DATABASE_URL ? '🟢 Configurada' : '🔴 No configurada',
      NODE_ENV: process.env.NODE_ENV ? `🟢 ${process.env.NODE_ENV}` : '🟡 No definida',
      CORS_ORIGIN: process.env.CORS_ORIGIN ? `🟢 ${process.env.CORS_ORIGIN}` : '🟡 * (por defecto)'
    };
    
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MapaClientes API - Documentación</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin-top: 30px;
        }
        .status-section {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .status-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .endpoint {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
        }
        .get { background: #d4edda; color: #155724; }
        .post { background: #d1ecf1; color: #0c5460; }
        .put { background: #fff3cd; color: #856404; }
        .delete { background: #f8d7da; color: #721c24; }
        .url {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 14px;
        }
        .description {
            margin-top: 8px;
            color: #6c757d;
        }
        .test-buttons {
            margin-top: 15px;
        }
        .test-button {
            background: #007bff;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
            text-decoration: none;
            display: inline-block;
            font-size: 12px;
        }
        .test-button:hover {
            background: #0056b3;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗺️ MapaClientes API</h1>
        
        <div class="status-section">
            <h2>📊 Estado del Sistema</h2>
            <div class="status-grid">
                <div class="status-card">
                    <h3>🔗 Base de Datos</h3>
                    <p><strong>Conexión:</strong> ${dbStatus} ${dbDetails}</p>
                    <p><strong>Inicialización:</strong> ${dbInitStatus}</p>
                </div>
                <div class="status-card">
                    <h3>🔧 Variables de Entorno</h3>
                    <p><strong>DATABASE_URL:</strong> ${envStatus.DATABASE_URL}</p>
                    <p><strong>NODE_ENV:</strong> ${envStatus.NODE_ENV}</p>
                    <p><strong>CORS_ORIGIN:</strong> ${envStatus.CORS_ORIGIN}</p>
                </div>
            </div>
        </div>

        <h2>🚀 Endpoints Disponibles</h2>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api</span>
            <div class="description">Información general de la API y lista de endpoints disponibles</div>
            <div class="test-buttons">
                <a href="/api" class="test-button">Probar</a>
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/ping</span>
            <div class="description">Health check rápido con información de base de datos</div>
            <div class="test-buttons">
                <a href="/api/ping" class="test-button">Probar</a>
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/health</span>
            <div class="description">Health check completo del sistema (memoria, BD, servicios)</div>
            <div class="test-buttons">
                <a href="/api/health" class="test-button">Probar</a>
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/env</span>
            <div class="description">Verificar configuración de variables de entorno</div>
            <div class="test-buttons">
                <a href="/api/env" class="test-button">Probar</a>
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/database</span>
            <div class="description">Información detallada de la base de datos y tablas</div>
            <div class="test-buttons">
                <a href="/api/database" class="test-button">Probar</a>
            </div>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/database/reinit</span>
            <div class="description">Reinicializar la base de datos (crear tablas si no existen)</div>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/init</span>
            <div class="description">Reintentar inicialización de la base de datos</div>
        </div>

        <h2>👥 Gestión de Clientes</h2>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/clientes</span>
            <div class="description">
                Obtener lista de clientes con paginación y filtros
                <br><strong>Parámetros:</strong> page, limit, search, activo
            </div>
            <div class="test-buttons">
                <a href="/api/clientes" class="test-button">Probar</a>
                <a href="/api/clientes?page=1&limit=5" class="test-button">Con paginación</a>
            </div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span>
            <span class="url">/api/clientes/:id</span>
            <div class="description">Obtener información de un cliente específico por ID</div>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span>
            <span class="url">/api/clientes</span>
            <div class="description">
                Crear un nuevo cliente
                <br><strong>Campos requeridos:</strong> nombre
                <br><strong>Campos opcionales:</strong> codigo_alternativo, razon, direccion, telefono, rut, activo, x, y
            </div>
        </div>

        <div class="endpoint">
            <span class="method put">PUT</span>
            <span class="url">/api/clientes/:id</span>
            <div class="description">Actualizar completamente un cliente existente</div>
        </div>

        <div class="endpoint">
            <span class="method delete">DELETE</span>
            <span class="url">/api/clientes/:id</span>
            <div class="description">Eliminar un cliente por ID</div>
        </div>

        <h2>📋 Ejemplo de Cliente</h2>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; overflow-x: auto;">
{
  "nombre": "Empresa ABC",
  "codigo_alternativo": "ABC001",
  "razon": "Empresa ABC S.A.",
  "direccion": "Av. Principal 123",
  "telefono": "+56912345678",
  "rut": "12.345.678-9",
  "activo": true,
  "x": -33.4489,
  "y": -70.6693
}
        </pre>

        <h2>🔍 Herramientas de Diagnóstico</h2>
        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px;">
            <p><strong>Para diagnosticar problemas:</strong></p>
            <ul>
                <li>Verificar <a href="/api/env">variables de entorno</a></li>
                <li>Comprobar <a href="/api/database">estado de la base de datos</a></li>
                <li>Realizar <a href="/api/health">health check completo</a></li>
                <li>Probar conexión con <a href="/api/ping">ping</a></li>
            </ul>
        </div>

        <div class="footer">
            <p>MapaClientes API v1.0.0 | ${new Date().toISOString()} | Netlify Functions</p>
        </div>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('❌ Error en ruta raíz:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta principal con información de la API
app.get('/api', (req, res) => {
  const apiInfo = {
    name: 'MapaClientes API',
    version: '1.0.0',
    description: 'API robusta para gestión de clientes con geolocalización',
    environment: process.env.NODE_ENV || 'production',
    database: {
      initialized: dbInitialized,
      autoInit: true
    },
    endpoints: {
      ping: '/api/ping',
      health: '/api/health',
      env: '/api/env',
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

// RUTA ENV - Verificar configuración de variables de entorno
app.get('/api/env', (req, res) => {
  try {
    const envCheck = {
      validation: envValidation,
      variables: {
        DATABASE_URL: process.env.DATABASE_URL ? 'CONFIGURADO' : 'NO CONFIGURADO',
        NODE_ENV: process.env.NODE_ENV || 'no definido',
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'no definido (usando *)',
        PORT: process.env.PORT || 'no definido (usando default)'
      },
      recommendations: []
    };

    // Agregar recomendaciones según el estado
    if (!process.env.DATABASE_URL) {
      envCheck.recommendations.push('🔴 CRÍTICO: Configura DATABASE_URL para producción');
    }

    if (!process.env.NODE_ENV) {
      envCheck.recommendations.push('🟡 RECOMENDADO: Configura NODE_ENV=production');
    }

    if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
      envCheck.recommendations.push('🟡 SEGURIDAD: Configura CORS_ORIGIN con tu dominio específico');
    }

    successResponse(res, envCheck, '🔧 Configuración de variables de entorno');
  } catch (error) {
    console.error('❌ Error verificando variables de entorno:', error);
    errorResponse(res, 'Error verificando configuración', 500, error.message);
  }
});

// RUTA INIT - Reintentar inicialización de la base de datos
app.post('/api/init', async (req, res) => {
  try {
    console.log('🔄 Reintentando inicialización de base de datos...');
    
    // Resetear estado
    dbInitialized = false;
    dbInitError = null;
    
    // Intentar inicializar nuevamente
    await initDB();
    
    if (dbInitialized) {
      successResponse(res, { 
        initialized: true, 
        timestamp: new Date().toISOString() 
      }, '✅ Base de datos inicializada exitosamente');
    } else {
      errorResponse(res, 'Error en la inicialización', 500, {
        error: dbInitError ? dbInitError.message : 'Error desconocido',
        errorCode: dbInitError ? dbInitError.code : null,
        errorDetail: dbInitError ? dbInitError.detail : null
      });
    }
  } catch (error) {
    console.error('❌ Error reintentando inicialización:', error);
    errorResponse(res, 'Error reintentando inicialización', 500, error.message);
  }
});

// RUTA HEALTH - Health check completo del sistema
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'Sistema saludable',
    timestamp: new Date().toISOString(),
    services: {}
  };

  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbTime = Date.now() - dbStart;
    
    healthCheck.services.database = {
      status: 'healthy',
      responseTime: `${dbTime}ms`
    };
  } catch (error) {
    healthCheck.services.database = {
      status: 'unhealthy',
      error: error.message
    };
    healthCheck.message = 'Sistema con problemas';
  }

  const memoryUsage = process.memoryUsage();
  healthCheck.services.memory = {
    status: 'healthy',
    usage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    }
  };

  const isHealthy = healthCheck.services.database.status === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  if (isHealthy) {
    successResponse(res, healthCheck, '✅ Sistema completamente saludable', statusCode);
  } else {
    errorResponse(res, '⚠️ Sistema con problemas', statusCode, healthCheck);
  }
});

// RUTAS DE CLIENTES

// Validación de cliente
const validateCliente = (cliente) => {
  const errors = [];
  if (!cliente.nombre || cliente.nombre.trim().length === 0) {
    errors.push('El nombre es requerido');
  }
  if (cliente.nombre && cliente.nombre.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }
  if (cliente.x && (isNaN(cliente.x) || cliente.x < -180 || cliente.x > 180)) {
    errors.push('La coordenada X debe ser un número válido entre -180 y 180');
  }
  if (cliente.y && (isNaN(cliente.y) || cliente.y < -90 || cliente.y > 90)) {
    errors.push('La coordenada Y debe ser un número válido entre -90 y 90');
  }
  return errors;
};

// GET /api/clientes - Obtener todos los clientes con paginación
app.get('/api/clientes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const activo = req.query.activo;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (nombre ILIKE $${paramCount} OR razon ILIKE $${paramCount} OR direccion ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (activo !== undefined) {
      paramCount++;
      whereClause += ` AND activo = $${paramCount}`;
      params.push(activo === 'true');
    }

    const countQuery = `SELECT COUNT(*) FROM clientes ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;
    
    const query = `
      SELECT id, codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y
      FROM clientes 
      ${whereClause}
      ORDER BY nombre ASC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    
    params.push(limit, offset);
    const result = await pool.query(query, params);

    const totalPages = Math.ceil(total / limit);
    
    const response = {
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    successResponse(res, response, 'Clientes obtenidos exitosamente');
  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    errorResponse(res, 'Error al obtener clientes', 500, error.message);
  }
});

// GET /api/clientes/:id - Obtener cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de cliente inválido', 400);
    }

    const query = 'SELECT * FROM clientes WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Cliente obtenido exitosamente');
  } catch (error) {
    console.error('❌ Error al obtener cliente:', error);
    errorResponse(res, 'Error al obtener cliente', 500, error.message);
  }
});

// POST /api/clientes - Crear nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const clienteData = req.body;
    
    const validationErrors = validateCliente(clienteData);
    if (validationErrors.length > 0) {
      return errorResponse(res, 'Datos de cliente inválidos', 400, validationErrors);
    }

    const {
      codigo_alternativo,
      nombre,
      razon,
      direccion,
      telefono,
      rut,
      activo = true,
      x,
      y
    } = clienteData;

    const query = `
      INSERT INTO clientes (codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y];
    const result = await pool.query(query, values);

    successResponse(res, result.rows[0], 'Cliente creado exitosamente', 201);
  } catch (error) {
    console.error('❌ Error al crear cliente:', error);
    
    if (error.code === '23505') {
      return errorResponse(res, 'Ya existe un cliente con ese código alternativo', 409);
    }
    
    errorResponse(res, 'Error al crear cliente', 500, error.message);
  }
});

// PUT /api/clientes/:id - Actualizar cliente completo
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clienteData = req.body;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de cliente inválido', 400);
    }

    const validationErrors = validateCliente(clienteData);
    if (validationErrors.length > 0) {
      return errorResponse(res, 'Datos de cliente inválidos', 400, validationErrors);
    }

    const {
      codigo_alternativo,
      nombre,
      razon,
      direccion,
      telefono,
      rut,
      activo,
      x,
      y
    } = clienteData;

    const query = `
      UPDATE clientes 
      SET codigo_alternativo = $1, nombre = $2, razon = $3, direccion = $4, 
          telefono = $5, rut = $6, activo = $7, x = $8, y = $9
      WHERE id = $10
      RETURNING *
    `;

    const values = [codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Cliente actualizado exitosamente');
  } catch (error) {
    console.error('❌ Error al actualizar cliente:', error);
    errorResponse(res, 'Error al actualizar cliente', 500, error.message);
  }
});

// DELETE /api/clientes/:id - Eliminar cliente
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de cliente inválido', 400);
    }

    const query = 'DELETE FROM clientes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Cliente eliminado exitosamente');
  } catch (error) {
    console.error('❌ Error al eliminar cliente:', error);
    errorResponse(res, 'Error al eliminar cliente', 500, error.message);
  }
});

// RUTA DATABASE INFO - Información detallada de la base de datos
app.get('/api/database', async (req, res) => {
  try {
    // Verificar si la base de datos está inicializada
    if (!dbInitialized) {
      return errorResponse(res, 'Base de datos no inicializada', 503, {
        error: dbInitError ? dbInitError.message : 'Error desconocido',
        errorCode: dbInitError ? dbInitError.code : null,
        errorDetail: dbInitError ? dbInitError.detail : null,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        connectionString: process.env.DATABASE_URL ? '[CONFIGURADO]' : '[USANDO FALLBACK]',
        timestamp: new Date().toISOString()
      });
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
      environment: {
        databaseUrl: process.env.DATABASE_URL ? 'CONFIGURADO' : 'USANDO FALLBACK',
        nodeEnv: process.env.NODE_ENV || 'no definido',
        corsOrigin: process.env.CORS_ORIGIN || '*',
        envValidation: envValidation
      },
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
