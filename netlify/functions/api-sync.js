// netlify/functions/api-sync.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

// Importar rutas directamente
import camionesRoutes from '../../routes/camiones.js';
import clientesRoutes from '../../routes/clientes.js';
import diasEntregaRoutes from '../../routes/diasEntrega.js';
import healthRoutes from '../../routes/health.js';
import pingRoutes from '../../routes/ping.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas principales
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API MapaClientes Backend',
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

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a MapaClientes Backend API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Registrar rutas
console.log('🔧 Registrando rutas...');
app.use('/api/camiones', camionesRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/dias-entrega', diasEntregaRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/ping', pingRoutes);
console.log('✅ Rutas registradas correctamente');

// Manejo de errores
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, _next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString(),
  });
});

export const handler = serverless(app);
