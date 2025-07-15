import express from 'express';
import serverless from 'serverless-http';
import { config, validateConfig } from '../config/index.js';
import { setupMiddleware } from '../middleware/index.js';
import { db, initializeDatabase } from '../db/index.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { logger } from '../middleware/logger.js';

// Importar rutas
import camionesRoutes from '../routes/camiones.js';
import clientesRoutes from '../routes/clientes.js';
import diasEntregaRoutes from '../routes/diasEntrega.js';
import healthRoutes from '../routes/health.js';
import pingRoutes from '../routes/ping.js';

// Crear aplicación Express
const app = express();

// Configurar middleware
setupMiddleware(app);

// Buffer parsing middleware para Netlify Functions
app.use(express.raw({ type: 'application/json' }));
app.use((req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString());
    } catch (error) {
      console.error('❌ Error parseando raw body:', error);
    }
  }
  next();
});

// Configurar rutas
app.use('/api/camiones', camionesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/dias-entrega', diasEntregaRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ping', pingRoutes);

// Ruta raíz
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Mapas Clientes Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      camiones: '/api/camiones',
      clientes: '/api/clientes',
      diasEntrega: '/api/dias-entrega',
      health: '/api/health',
      ping: '/api/ping',
    },
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Inicializar base de datos y aplicación
let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) return;
  
  try {
    console.log('🚀 Iniciando aplicación...');
    
    // Validar configuración
    validateConfig();
    console.log('✅ Configuración validada');
    
    // Inicializar base de datos
    await initializeDatabase();
    console.log('✅ Base de datos inicializada');
    
    isInitialized = true;
    console.log('🎉 Aplicación inicializada exitosamente');
  } catch (error) {
    console.error('❌ Error inicializando aplicación:', error);
    throw error;
  }
};

// Middleware para inicializar la aplicación en cada request
app.use(async (req, res, next) => {
  try {
    await initializeApp();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
    });
  }
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Exportar para Netlify Functions
export const handler = serverless(app, {
  binary: false,
});

export default app;
