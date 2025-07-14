// netlify/functions/api.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import pool from '../../config/database.js';

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
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      ping: '/api/ping',
      health: '/api/health',
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
