import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { config, validateConfig } from './config/index.js';

// Configurar variables de entorno
dotenv.config();

// Validar configuración
validateConfig();

// Importar rutas
import clientesRoutes from './routes/clientes.js';
import camionesRoutes from './routes/camiones.js';
import diasEntregaRoutes from './routes/diasEntrega.js';
import healthRoutes from './routes/health.js';
import pingRoutes from './routes/ping.js';

// Crear aplicación Express
const app = express();

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Middlewares globales
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas principales
app.use('/api/clientes', clientesRoutes);
app.use('/api/camiones', camionesRoutes);
app.use('/api/dias-entrega', diasEntregaRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ping', pingRoutes);

// Ruta de información de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API MapaClientes Backend',
    version: '1.0.0',
    endpoints: {
      clientes: '/api/clientes',
      camiones: '/api/camiones',
      diasEntrega: '/api/dias-entrega',
      health: '/api/health',
      ping: '/api/ping',
    },
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a MapaClientes Backend API',
    version: '1.0.0',
    documentation: '/api',
    timestamp: new Date().toISOString(),
  });
});

// Middleware de manejo de errores
app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error:
      config.nodeEnv === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  console.log('🚀 Servidor corriendo en http://localhost:' + PORT);
  console.log('📊 API disponible en http://localhost:' + PORT + '/api');
  console.log('🏓 Health check en http://localhost:' + PORT + '/api/ping');
  console.log('🎯 Prisma Studio: npx prisma studio');
});

export default app;
