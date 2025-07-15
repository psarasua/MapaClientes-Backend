// netlify/functions/api.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import pkg from 'pg';
import { initializeDatabase, checkTableExists, getDatabaseInfo } from '../../config/dbInit.js';
import { seedCamiones } from '../../seeders/camionesSeeder.js';
import { seedDiasEntrega } from '../../seeders/diasEntregaSeeder.js';

// Importar rutas modularizadas
import camionesRoutes from '../../routes/camiones.js';
import clientesRoutes from '../../routes/clientes.js';
import diasEntregaRoutes from '../../routes/diasEntrega.js';
import healthRoutes from '../../routes/health.js';
import pingRoutes from '../../routes/ping.js';

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
    warnings,
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
  credentials: true,
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
    timestamp: new Date().toISOString(),
  });
};

const errorResponse = (res, message = 'Error en la operación', statusCode = 400, error = null) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details: error,
    timestamp: new Date().toISOString(),
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
      CORS_ORIGIN: process.env.CORS_ORIGIN ? `🟢 ${process.env.CORS_ORIGIN}` : '🟡 * (por defecto)',
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

        <h2>� Gestión de Camiones</h2>

        <div class="endpoint-grid">
            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/camiones</div>
                <div class="description">
                    <strong>Obtener lista de camiones</strong><br>
                    Soporta paginación y filtros: page, limit, search
                </div>
                <div class="test-buttons">
                    <a href="/api/camiones" class="test-button">Probar</a>
                    <a href="/api/camiones?page=1&limit=5" class="test-button">Con filtros</a>
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/camiones/:id</div>
                <div class="description">
                    <strong>Obtener camión específico</strong><br>
                    Devuelve información completa de un camión por su ID.
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method post">POST</div>
                <div class="url">/api/camiones</div>
                <div class="description">
                    <strong>Crear nuevo camión</strong><br>
                    Campos requeridos: descripcion
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method put">PUT</div>
                <div class="url">/api/camiones/:id</div>
                <div class="description">
                    <strong>Actualizar camión</strong><br>
                    Actualiza completamente la información de un camión existente.
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method delete">DELETE</div>
                <div class="url">/api/camiones/:id</div>
                <div class="description">
                    <strong>Eliminar camión</strong><br>
                    Elimina permanentemente un camión de la base de datos.
                </div>
            </div>
        </div>

        <h2>📋 Ejemplo de Camión</h2>
        <pre style="background: #f8f9fa; padding: 15px; border-radius: 8px; overflow-x: auto;">
{
  "descripcion": "Camión de Reparto Norte"
}
        </pre>

        <h2>�📋 Ejemplo de Cliente</h2>
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
app.get('/api', async (req, res) => {
  try {
    // Verificar estado de la base de datos
    let dbStatus = '🔴 Desconectada';
    let dbDetails = '';
    let dbInitStatus = '🔴 No inicializada';
    let dbResponseTime = 0;

    try {
      const dbStart = Date.now();
      await pool.query('SELECT 1');
      dbResponseTime = Date.now() - dbStart;
      dbStatus = '🟢 Conectada';
      dbDetails = `${dbResponseTime}ms`;
    } catch (error) {
      dbStatus = '🔴 Error de conexión';
      dbDetails = error.message;
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
      CORS_ORIGIN: process.env.CORS_ORIGIN ? `🟢 ${process.env.CORS_ORIGIN}` : '🟡 * (por defecto)',
    };

    // Obtener información detallada de la base de datos
    let dbInfo = {
      connected: false,
      version: 'Desconocida',
      size: 'Desconocido',
      tables: [],
      totalTables: 0,
      totalColumns: 0,
      connectionPool: {
        totalConnections: 0,
        idleConnections: 0,
        waitingClients: 0,
      },
    };

    let tableInfo = '';
    let detailedDbInfo = '';

    try {
      if (dbInitialized) {
        // Información básica de la base de datos
        const versionQuery = await pool.query('SELECT version() as version');
        const sizeQuery = await pool.query(`
          SELECT 
            pg_database.datname,
            pg_size_pretty(pg_database_size(pg_database.datname)) as size
          FROM pg_database 
          WHERE datname = current_database()
        `);

        dbInfo.version = versionQuery.rows[0].version;
        dbInfo.size = sizeQuery.rows[0].size;
        dbInfo.connected = true;

        // Información del pool de conexiones
        dbInfo.connectionPool = {
          totalConnections: pool.totalCount,
          idleConnections: pool.idleCount,
          waitingClients: pool.waitingCount,
        };

        // Información detallada de las tablas con columnas
        const tablesDetailQuery = await pool.query(`
          SELECT 
            t.table_name,
            t.table_type,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default,
            c.ordinal_position,
            (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as total_columns
          FROM information_schema.tables t
          LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
          WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
          ORDER BY t.table_name, c.ordinal_position
        `);

        // Organizar información por tabla
        const tablesMap = {};
        tablesDetailQuery.rows.forEach(row => {
          if (!tablesMap[row.table_name]) {
            tablesMap[row.table_name] = {
              name: row.table_name,
              type: row.table_type,
              totalColumns: row.total_columns,
              columns: [],
            };
          }

          if (row.column_name) {
            tablesMap[row.table_name].columns.push({
              name: row.column_name,
              type: row.data_type,
              nullable: row.is_nullable === 'YES',
              default: row.column_default,
              position: row.ordinal_position,
            });
          }
        });

        dbInfo.tables = Object.values(tablesMap);
        dbInfo.totalTables = Object.keys(tablesMap).length;
        dbInfo.totalColumns = tablesDetailQuery.rows.length;

        // Generar HTML para tabla simple
        tableInfo = Object.values(tablesMap).map(table =>
          `<tr><td>${table.name}</td><td>${table.totalColumns} columnas</td></tr>`,
              <div class="db-info-card">
                <h4>📊 Estadísticas Generales</h4>
                <div class="info-item"><strong>Tipo:</strong> PostgreSQL</div>
                <div class="info-item"><strong>Versión:</strong> ${dbInfo.version.split(' ')[0]} ${dbInfo.version.split(' ')[1]}</div>
                <div class="info-item"><strong>Tamaño BD:</strong> ${dbInfo.size}</div>
                <div class="info-item"><strong>Total Tablas:</strong> ${dbInfo.totalTables}</div>
                <div class="info-item"><strong>Total Columnas:</strong> ${dbInfo.totalColumns}</div>
              </div>
              
              <div class="db-info-card">
                <h4>🔗 Pool de Conexiones</h4>
                <div class="info-item"><strong>Conexiones Totales:</strong> ${dbInfo.connectionPool.totalConnections}</div>
                <div class="info-item"><strong>Conexiones Inactivas:</strong> ${dbInfo.connectionPool.idleConnections}</div>
                <div class="info-item"><strong>Clientes Esperando:</strong> ${dbInfo.connectionPool.waitingClients}</div>
                <div class="info-item"><strong>Tiempo Respuesta:</strong> ${dbResponseTime}ms</div>
              </div>
            </div>
          </div>
          
          <div class="tables-detail-section">
            <h3>📋 Estructura Detallada de Tablas</h3>
            ${Object.values(tablesMap).map(table => `
              <div class="table-detail-card">
                <h4>📄 ${table.name}</h4>
                <div class="table-meta">
                  <span class="badge">Tipo: ${table.type}</span>
                  <span class="badge">Columnas: ${table.totalColumns}</span>
                </div>
                <div class="columns-grid">
                  ${table.columns.map(col => `
                    <div class="column-item">
                      <strong>${col.name}</strong>
                      <span class="column-type">${col.type}</span>
                      ${col.nullable ? '<span class="nullable">NULL</span>' : '<span class="not-null">NOT NULL</span>'}
                      ${col.default ? `<span class="default">Default: ${col.default}</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `;

      }
    } catch (error) {
      tableInfo = '<tr><td colspan="2">Error obteniendo información de tablas</td></tr>';
      detailedDbInfo = `
        <div class="alert alert-danger">
          <strong>❌ Error obteniendo información de BD:</strong> ${error.message}
        </div>
      `;
    }

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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
            font-size: 2.5em;
        }
        h2 {
            color: #34495e;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin-top: 30px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .status-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
        }
        .status-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        .status-card h3 {
            margin-top: 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status-item {
            margin: 10px 0;
            padding: 8px 12px;
            border-radius: 6px;
            background: #fff;
            border-left: 4px solid #3498db;
        }
        .test-section {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border: 2px solid #3498db;
        }
        .test-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        .test-button {
            background: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            font-size: 14px;
        }
        .test-button:hover {
            background: #2980b9;
            transform: translateY(-2px);
        }
        .test-button.danger {
            background: #e74c3c;
        }
        .test-button.danger:hover {
            background: #c0392b;
        }
        .test-button.success {
            background: #27ae60;
        }
        .test-button.success:hover {
            background: #219a52;
        }
        .endpoint-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        .endpoint-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        .endpoint-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .method {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        .get { background: #d4edda; color: #155724; }
        .post { background: #d1ecf1; color: #0c5460; }
        .put { background: #fff3cd; color: #856404; }
        .delete { background: #f8d7da; color: #721c24; }
        .url {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
        }
        .description {
            margin-top: 12px;
            color: #6c757d;
            line-height: 1.5;
        }
        .table-container {
            overflow-x: auto;
            margin: 20px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        th {
            background: #3498db;
            color: white;
            font-weight: 600;
        }
        .code-block {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #dee2e6;
            color: #6c757d;
        }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid;
        }
        .alert-success {
            background: #d4edda;
            border-color: #27ae60;
            color: #155724;
        }
        .alert-danger {
            background: #f8d7da;
            border-color: #e74c3c;
            color: #721c24;
        }
        .alert-warning {
            background: #fff3cd;
            border-color: #f39c12;
            color: #856404;
        }
        .db-info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border: 2px solid #17a2b8;
        }
        .db-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        .db-info-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .db-info-card h4 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 1.1em;
        }
        .info-item {
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #f1f3f4;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .tables-detail-section {
            margin: 30px 0;
        }
        .table-detail-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        .table-detail-card h4 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .table-meta {
            margin: 10px 0;
            display: flex;
            gap: 10px;
        }
        .badge {
            background: #6c757d;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .columns-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .column-item {
            background: white;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e9ecef;
            font-size: 14px;
        }
        .column-item strong {
            display: block;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .column-type {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            font-family: monospace;
            margin-right: 5px;
        }
        .nullable {
            background: #ffc107;
            color: #856404;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            margin-right: 5px;
        }
        .not-null {
            background: #dc3545;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            margin-right: 5px;
        }
        .default {
            background: #17a2b8;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            display: block;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗺️ MapaClientes API</h1>
        
        <div class="status-grid">
            <div class="status-card">
                <h3>🔗 Estado de la Base de Datos</h3>
                <div class="status-item">
                    <strong>Conexión:</strong> ${dbStatus} ${dbDetails}
                </div>
                <div class="status-item">
                    <strong>Inicialización:</strong> ${dbInitStatus}
                </div>
                <div class="status-item">
                    <strong>Tiempo de respuesta:</strong> ${dbResponseTime}ms
                </div>
            </div>
            
            <div class="status-card">
                <h3>🔧 Variables de Entorno</h3>
                <div class="status-item">
                    <strong>DATABASE_URL:</strong> ${envStatus.DATABASE_URL}
                </div>
                <div class="status-item">
                    <strong>NODE_ENV:</strong> ${envStatus.NODE_ENV}
                </div>
                <div class="status-item">
                    <strong>CORS_ORIGIN:</strong> ${envStatus.CORS_ORIGIN}
                </div>
            </div>
        </div>

        <div class="test-section">
            <h3>🧪 Pruebas de Conexión y Diagnóstico</h3>
            <p>Utiliza estos botones para probar la conectividad, funcionalidad y obtener información detallada:</p>
            <div class="test-buttons">
                <a href="/api/ping" class="test-button success">🏓 Ping DB</a>
                <a href="/api/health" class="test-button">🏥 Health Check</a>
                <a href="/api/env" class="test-button">🔧 Variables</a>
                <a href="/api/database" class="test-button">📊 Info DB</a>
                <button onclick="testConnection()" class="test-button">🔄 Test Conexión</button>
                <button onclick="reinitDB()" class="test-button danger">🔁 Reinicializar DB</button>
                <button onclick="refreshDbInfo()" class="test-button">🔄 Actualizar Info</button>
            </div>
            <div id="testResult"></div>
        </div>

        ${detailedDbInfo}

        ${tableInfo ? `
        <div class="table-container">
            <h3>📋 Tablas de la Base de Datos</h3>
            <table>
                <thead>
                    <tr>
                        <th>Tabla</th>
                        <th>Información</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableInfo}
                </tbody>
            </table>
        </div>
        ` : ''}

        <h2>🌱 Seeders de Base de Datos</h2>
        
        <div class="test-section">
            <h3>🗃️ Población de Datos</h3>
            <p>Los seeders permiten insertar datos de ejemplo en la base de datos de forma rápida y consistente:</p>
            <div class="test-buttons">
                <button onclick="runSeeder('all')" class="test-button success">🌱 Ejecutar Todos los Seeders</button>
                <button onclick="runSeeder('camiones')" class="test-button">🚛 Seeder de Camiones</button>
                <button onclick="runSeeder('dias')" class="test-button">🗓️ Seeder de Días de Entrega</button>
            </div>
            <div id="seederResult"></div>
        </div>

        <div class="endpoint-grid">
            <div class="endpoint-card">
                <div class="method post">POST</div>
                <div class="url">/api/seeders</div>
                <div class="description">
                    <strong>Ejecutar todos los seeders</strong><br>
                    Ejecuta todos los seeders disponibles para poblar la base de datos con datos de ejemplo.
                </div>
                <div class="test-buttons">
                    <button onclick="runSeeder('all')" class="test-button success">Ejecutar</button>
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method post">POST</div>
                <div class="url">/api/seeders/camiones</div>
                <div class="description">
                    <strong>Seeder de camiones</strong><br>
                    Inserta datos de ejemplo para los camiones de reparto en la base de datos.
                </div>
                <div class="test-buttons">
                    <button onclick="runSeeder('camiones')" class="test-button">Ejecutar</button>
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method post">POST</div>
                <div class="url">/api/seeders/dias</div>
                <div class="description">
                    <strong>Seeder de días de entrega</strong><br>
                    Inserta los días de la semana (Lunes a Viernes) para definir días de entrega.
                </div>
                <div class="test-buttons">
                    <button onclick="runSeeder('dias')" class="test-button">Ejecutar</button>
                </div>
            </div>
        </div>

        <h2>🚀 Documentación de Endpoints</h2>
        
        <div class="endpoint-grid">
            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/ping</div>
                <div class="description">
                    <strong>Health check rápido</strong><br>
                    Verifica la conexión a la base de datos y devuelve información del servidor.
                </div>
                <div class="test-buttons">
                    <a href="/api/ping" class="test-button">Probar</a>
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/health</div>
                <div class="description">
                    <strong>Health check completo</strong><br>
                    Información detallada del sistema: memoria, base de datos, uptime.
                </div>
                <div class="test-buttons">
                    <a href="/api/health" class="test-button">Probar</a>
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/clientes</div>
                <div class="description">
                    <strong>Obtener lista de clientes</strong><br>
                    Soporta paginación y filtros: page, limit, search, activo
                </div>
                <div class="test-buttons">
                    <a href="/api/clientes" class="test-button">Probar</a>
                    <a href="/api/clientes?page=1&limit=5" class="test-button">Con filtros</a>
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/clientes/:id</div>
                <div class="description">
                    <strong>Obtener cliente específico</strong><br>
                    Devuelve información completa de un cliente por su ID.
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method post">POST</div>
                <div class="url">/api/clientes</div>
                <div class="description">
                    <strong>Crear nuevo cliente</strong><br>
                    Campos requeridos: nombre<br>
                    Opcionales: codigo_alternativo, razon, direccion, telefono, rut, x, y
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method put">PUT</div>
                <div class="url">/api/clientes/:id</div>
                <div class="description">
                    <strong>Actualizar cliente</strong><br>
                    Actualiza completamente la información de un cliente existente.
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method delete">DELETE</div>
                <div class="url">/api/clientes/:id</div>
                <div class="description">
                    <strong>Eliminar cliente</strong><br>
                    Elimina permanentemente un cliente de la base de datos.
                </div>
            </div>

            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/camiones</div>
                <div class="description">
                    <strong>Obtener lista de camiones</strong><br>
                    Soporta paginación y filtros: page, limit, search
                </div>
                <div class="test-buttons">
                    <a href="/api/camiones" class="test-button">Probar</a>
                    <a href="/api/camiones?page=1&limit=5" class="test-button">Con filtros</a> 
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/camiones/:id</div>
                <div class="description">
                    <strong>Obtener camión específico</strong><br>
                    Devuelve información completa de un camión por su ID.
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method post">POST</div>
                <div class="url">/api/camiones</div>
                <div class="description">
                    <strong>Crear nuevo camión</strong><br>
                    Campos requeridos: descripcion<br>
                    Ejemplo: {"descripcion": "Camión Repartidor 1"}
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method put">PUT</div>
                <div class="url">/api/camiones/:id</div>
                <div class="description">
                    <strong>Actualizar camión</strong><br>
                    Actualiza completamente la información de un camión existente.
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method delete">DELETE</div>
                <div class="url">/api/camiones/:id</div>
                <div class="description">
                    <strong>Eliminar camión</strong><br>
                    Elimina permanentemente un camión de la base de datos.
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/dias-entrega</div>
                <div class="description">
                    <strong>Obtener lista de días de entrega</strong><br>
                    Soporta paginación y filtros: page, limit, search
                </div>
                <div class="test-buttons">
                    <a href="/api/dias-entrega" class="test-button">Probar</a>
                    <a href="/api/dias-entrega?page=1&limit=5" class="test-button">Con filtros</a> 
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/dias-entrega/:id</div>
                <div class="description">
                    <strong>Obtener día de entrega específico</strong><br>
                    Devuelve información completa de un día de entrega por su ID.
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method post">POST</div>
                <div class="url">/api/dias-entrega</div>
                <div class="description">
                    <strong>Crear nuevo día de entrega</strong><br>
                    Campos requeridos: descripcion<br>
                    Ejemplo: {"descripcion": "Sábado"}
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method put">PUT</div>
                <div class="url">/api/dias-entrega/:id</div>
                <div class="description">
                    <strong>Actualizar día de entrega</strong><br>
                    Actualiza completamente la información de un día de entrega existente.
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method delete">DELETE</div>
                <div class="url">/api/dias-entrega/:id</div>
                <div class="description">
                    <strong>Eliminar día de entrega</strong><br>
                    Elimina permanentemente un día de entrega de la base de datos.
                </div>
            </div>
            <div class="endpoint-card">
                <div class="method get">GET</div>
                <div class="url">/api/database</div>
                <div class="description">
                    <strong>Información de la base de datos</strong><br>
                    Estado de tablas, estructura y configuración.
                </div>
                <div class="test-buttons">
                    <a href="/api/database" class="test-button">Probar</a>
                </div>
            </div>
        </div>

        <h2>📋 Ejemplo de Cliente</h2>
        <div class="code-block">
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
        </div>
        
        <h2>🚛 Ejemplo de Camión</h2>
        <div class="code-block">
{
  "descripcion": "Camión Repartidor 1"
}
        </div>
        
        <h2>📅 Ejemplo de Día de Entrega</h2>
        <div class="code-block">
{
  "descripcion": "Sábado"
}
        </div>

        <div class="footer">
            <p>MapaClientes API v1.0.0 | ${new Date().toISOString()} | Netlify Functions</p>
        </div>
    </div>

    <script>
        async function testConnection() {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '🔄 Probando...';
            button.disabled = true;
            
            const resultDiv = document.getElementById('testResult');
            
            try {
                const response = await fetch('/api/ping');
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.innerHTML = \`
                        <div class="alert alert-success">
                            <strong>✅ Conexión exitosa!</strong><br>
                            Estado: \${data.data.database.status}<br>
                            Tiempo: \${data.data.database.responseTime}
                        </div>
                    \`;
                } else {
                    resultDiv.innerHTML = \`
                        <div class="alert alert-danger">
                            <strong>❌ Error de conexión</strong><br>
                            \${data.error}
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div class="alert alert-danger">
                        <strong>❌ Error de red</strong><br>
                        \${error.message}
                    </div>
                \`;
            }
            
            button.textContent = originalText;
            button.disabled = false;
        }

        async function reinitDB() {
            if (!confirm('¿Estás seguro de que quieres reinicializar la base de datos?')) {
                return;
            }
            
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '🔄 Reinicializando...';
            button.disabled = true;
            
            const resultDiv = document.getElementById('testResult');
            
            try {
                const response = await fetch('/api/database/reinit', {
                    method: 'POST'
                });
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.innerHTML = \`
                        <div class="alert alert-success">
                            <strong>✅ Base de datos reinicializada!</strong><br>
                            \${data.message}
                        </div>
                    \`;
                    setTimeout(() => location.reload(), 2000);
                } else {
                    resultDiv.innerHTML = \`
                        <div class="alert alert-danger">
                            <strong>❌ Error reinicializando</strong><br>
                            \${data.error}
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div class="alert alert-danger">
                        <strong>❌ Error de red</strong><br>
                        \${error.message}
                    </div>
                \`;
            }
            
            button.textContent = originalText;
            button.disabled = false;
        }

        async function runSeeder(type) {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '🔄 Ejecutando...';
            button.disabled = true;
            
            const resultDiv = document.getElementById('seederResult');
            
            try {
                let endpoint = '/api/seeders';
                if (type === 'camiones') {
                    endpoint = '/api/seeders/camiones';
                } else if (type === 'dias') {
                    endpoint = '/api/seeders/dias';
                }
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    let message = '<strong>✅ Seeders ejecutados exitosamente!</strong><br>';
                    
                    if (data.data.camiones) {
                        message += 'Se insertaron ' + data.data.camiones.length + ' camiones en la base de datos<br>';
                        const camionesNombres = data.data.camiones.map(function(c) { return c.descripcion; }).join(', ');
                        message += 'Camiones: ' + camionesNombres;
                    }
                    
                    if (data.data.dias_entrega) {
                        message += 'Se insertaron ' + data.data.dias_entrega.length + ' días de entrega en la base de datos<br>';
                        const diasNombres = data.data.dias_entrega.map(function(d) { return d.descripcion; }).join(', ');
                        message += 'Días: ' + diasNombres;
                    }
                    
                    if (data.data.seeders) {
                        message += 'Seeders ejecutados: ' + data.data.seeders.join(', ');
                    }
                    
                    resultDiv.innerHTML = '<div class="alert alert-success">' + message + '</div>';
                    
                    // Actualizar información después de 2 segundos
                    setTimeout(function() {
                        refreshDbInfo();
                    }, 2000);
                } else {
                    const errorMessage = '<div class="alert alert-danger"><strong>❌ Error ejecutando seeders</strong><br>' + data.error + '</div>';
                    resultDiv.innerHTML = errorMessage;
                }
            } catch (error) {
                const errorMessage = '<div class="alert alert-danger"><strong>❌ Error de red</strong><br>' + error.message + '</div>';
                resultDiv.innerHTML = errorMessage;
            }
            
            button.textContent = originalText;
            button.disabled = false;
        }

        async function refreshDbInfo() {
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '🔄 Actualizando...';
            button.disabled = true;
            
            try {
                // Simplemente recargar la página para obtener información actualizada
                setTimeout(() => {
                    location.reload();
                }, 500);
            } catch (error) {
                button.textContent = originalText;
                button.disabled = false;
            }
        }
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('❌ Error en documentación API:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
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
        version: result.rows[0].db_version.split(' ')[0] + ' ' + result.rows[0].db_version.split(' ')[1],
      },
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
        error: error.message,
      },
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
        PORT: process.env.PORT || 'no definido (usando default)',
      },
      recommendations: [],
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
        timestamp: new Date().toISOString(),
      }, '✅ Base de datos inicializada exitosamente');
    } else {
      errorResponse(res, 'Error en la inicialización', 500, {
        error: dbInitError ? dbInitError.message : 'Error desconocido',
        errorCode: dbInitError ? dbInitError.code : null,
        errorDetail: dbInitError ? dbInitError.detail : null,
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
    services: {},
  };

  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbTime = Date.now() - dbStart;

    healthCheck.services.database = {
      status: 'healthy',
      responseTime: `${dbTime}ms`,
    };
  } catch (error) {
    healthCheck.services.database = {
      status: 'unhealthy',
      error: error.message,
    };
    healthCheck.message = 'Sistema con problemas';
  }

  const memoryUsage = process.memoryUsage();
  healthCheck.services.memory = {
    status: 'healthy',
    usage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    },
  };

  const isHealthy = healthCheck.services.database.status === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  if (isHealthy) {
    successResponse(res, healthCheck, '✅ Sistema completamente saludable', statusCode);
  } else {
    errorResponse(res, '⚠️ Sistema con problemas', statusCode, healthCheck);
  }
});

// =============================================================================
// CRUD DÍAS DE ENTREGA
// =============================================================================

// Función de validación para días de entrega
function validateDiaEntrega(diaData) {
  const errors = [];

  if (!diaData || typeof diaData !== 'object') {
    errors.push('Los datos del día son requeridos');
    return errors;
  }

  if (!diaData.descripcion || typeof diaData.descripcion !== 'string' || diaData.descripcion.trim() === '') {
    errors.push('La descripción es requerida y debe ser un texto válido');
  }

  return errors;
}

// GET /api/dias-entrega - Obtener todos los días de entrega con paginación
app.get('/api/dias-entrega', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM dias_entrega';
    let countQuery = 'SELECT COUNT(*) FROM dias_entrega';
    let params = [];

    // Aplicar filtros de búsqueda
    if (search) {
      query += ' WHERE descripcion ILIKE $1';
      countQuery += ' WHERE descripcion ILIKE $1';
      params.push(`%${search}%`);
    }

    // Agregar ordenamiento y paginación
    query += ' ORDER BY id ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    successResponse(res, {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }, 'Días de entrega obtenidos exitosamente');
  } catch (error) {
    console.error('❌ Error al obtener días de entrega:', error);
    errorResponse(res, 'Error al obtener días de entrega', 500, error.message);
  }
});

// GET /api/dias-entrega/:id - Obtener día de entrega por ID
app.get('/api/dias-entrega/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de día de entrega inválido', 400);
    }

    const query = 'SELECT * FROM dias_entrega WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Día de entrega no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Día de entrega obtenido exitosamente');
  } catch (error) {
    console.error('❌ Error al obtener día de entrega:', error);
    errorResponse(res, 'Error al obtener día de entrega', 500, error.message);
  }
});

// POST /api/dias-entrega - Crear nuevo día de entrega
app.post('/api/dias-entrega', async (req, res) => {
  try {
    let diaData = req.body;

    // Si el cuerpo viene como buffer, parsearlo
    if (Buffer.isBuffer(diaData)) {
      try {
        diaData = JSON.parse(diaData.toString());
      } catch (parseError) {
        return errorResponse(res, 'Formato JSON inválido', 400, parseError.message);
      }
    }

    console.log('📝 Datos recibidos para crear día de entrega:', diaData);

    const validationErrors = validateDiaEntrega(diaData);
    console.log('🔍 Errores de validación:', validationErrors);

    if (validationErrors.length > 0) {
      return errorResponse(res, 'Datos de día de entrega inválidos', 400, validationErrors);
    }

    const { descripcion } = diaData;
    console.log('📅 Descripción extraída:', descripcion);

    const query = `
      INSERT INTO dias_entrega (descripcion)
      VALUES ($1)
      RETURNING *
    `;

    const result = await pool.query(query, [descripcion]);

    successResponse(res, result.rows[0], 'Día de entrega creado exitosamente', 201);
  } catch (error) {
    console.error('❌ Error al crear día de entrega:', error);

    // Error de clave única (PostgreSQL)
    if (error.code === '23505') {
      return errorResponse(res, 'Ya existe un día de entrega con esa descripción', 409);
    }

    // Error de violación de restricción NOT NULL
    if (error.code === '23502') {
      return errorResponse(res, 'Faltan campos requeridos', 400);
    }

    errorResponse(res, 'Error al crear día de entrega', 500, error.message);
  }
});

// PUT /api/dias-entrega/:id - Actualizar día de entrega completo
app.put('/api/dias-entrega/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let diaData = req.body;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de día de entrega inválido', 400);
    }

    // Si el cuerpo viene como buffer, parsearlo
    if (Buffer.isBuffer(diaData)) {
      try {
        diaData = JSON.parse(diaData.toString());
      } catch (parseError) {
        return errorResponse(res, 'Formato JSON inválido', 400, parseError.message);
      }
    }

    const validationErrors = validateDiaEntrega(diaData);
    if (validationErrors.length > 0) {
      return errorResponse(res, 'Datos de día de entrega inválidos', 400, validationErrors);
    }

    const { descripcion } = diaData;

    const query = `
      UPDATE dias_entrega 
      SET descripcion = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [descripcion, id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Día de entrega no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Día de entrega actualizado exitosamente');
  } catch (error) {
    console.error('❌ Error al actualizar día de entrega:', error);

    if (error.code === '23505') {
      return errorResponse(res, 'Ya existe un día de entrega con esa descripción', 409);
    }

    errorResponse(res, 'Error al actualizar día de entrega', 500, error.message);
  }
});

// DELETE /api/dias-entrega/:id - Eliminar día de entrega
app.delete('/api/dias-entrega/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de día de entrega inválido', 400);
    }

    // Verificar si el día está siendo usado en otras tablas
    const checkUsageQuery = `
      SELECT COUNT(*) as count 
      FROM camiones_dias 
      WHERE dia_entrega_id = $1
    `;

    const usageResult = await pool.query(checkUsageQuery, [id]);

    if (usageResult.rows[0].count > 0) {
      return errorResponse(res, 'No se puede eliminar el día de entrega porque está siendo usado en asignaciones de camiones', 400);
    }

    const query = 'DELETE FROM dias_entrega WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Día de entrega no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Día de entrega eliminado exitosamente');
  } catch (error) {
    console.error('❌ Error al eliminar día de entrega:', error);

    if (error.code === '23503') {
      return errorResponse(res, 'No se puede eliminar el día de entrega porque está siendo usado en otras tablas', 400);
    }

    errorResponse(res, 'Error al eliminar día de entrega', 500, error.message);
  }
});

// =============================================================================
// ENDPOINTS DE SEEDERS
// =============================================================================

// RUTA SEEDERS - Ejecutar todos los seeders
app.post('/api/seeders', async (req, res) => {
  try {
    console.log('🌱 Ejecutando todos los seeders...');

    // Ejecutar seeder de camiones pasando el pool de conexiones
    const camionesResult = await seedCamiones(pool);

    // Ejecutar seeder de días de entrega pasando el pool de conexiones
    const diasResult = await seedDiasEntrega(pool);

    successResponse(res, {
      seeders: ['camiones', 'dias_entrega'],
      camiones: camionesResult,
      dias_entrega: diasResult,
      message: 'Todos los seeders ejecutados correctamente',
    }, '✅ Todos los seeders ejecutados exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    errorResponse(res, 'Error ejecutando seeders', 500, error.message);
  }
});

// RUTA SEEDERS CAMIONES - Ejecutar solo seeder de camiones
app.post('/api/seeders/camiones', async (req, res) => {
  try {
    console.log('🚛 Ejecutando seeder de camiones...');

    // Ejecutar seeder de camiones pasando el pool de conexiones
    const result = await seedCamiones(pool);

    successResponse(res, {
      camiones: result,
      message: 'Seeder de camiones ejecutado correctamente',
    }, '✅ Seeder de camiones ejecutado exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seeder de camiones:', error);
    errorResponse(res, 'Error ejecutando seeder de camiones', 500, error.message);
  }
});

// RUTA SEEDERS DIAS_ENTREGA - Ejecutar solo seeder de días de entrega
app.post('/api/seeders/dias', async (req, res) => {
  try {
    console.log('🗓️ Ejecutando seeder de días de entrega...');

    // Ejecutar seeder de días de entrega pasando el pool de conexiones
    const result = await seedDiasEntrega(pool);

    successResponse(res, {
      dias_entrega: result,
      message: 'Seeder de días de entrega ejecutado correctamente',
    }, '✅ Seeder de días de entrega ejecutado exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seeder de días de entrega:', error);
    errorResponse(res, 'Error ejecutando seeder de días de entrega', 500, error.message);
  }
});

// Usar las rutas modularizadas
app.use('/api/camiones', camionesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/dias-entrega', diasEntregaRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ping', pingRoutes);

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
