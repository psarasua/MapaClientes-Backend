// netlify/functions/api.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import { requestLogger } from '../../middleware/logger.js';
import { errorHandler, notFound } from '../../middleware/errorHandler.js';
import { successResponse } from '../../utils/responses.js';

// Importar rutas
import pingRouter from '../../routes/ping.js';
import clientesRouter from '../../routes/clientes.js';
import healthRouter from '../../routes/health.js';

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

// Middleware de logging
app.use(requestLogger);

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
    },
    documentation: {
      swagger: '/api/docs',
      github: 'https://github.com/psarasua/MapaClientes-Backend'
    }
  };

  successResponse(res, apiInfo, '🚀 API MapaClientes funcionando correctamente');
});

// Registrar rutas
app.use('/api/ping', pingRouter);
app.use('/api/health', healthRouter);
app.use('/api/clientes', clientesRouter);

// Middleware de manejo de rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

export const handler = serverless(app);
