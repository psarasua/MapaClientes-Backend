// netlify/functions/api.js
// Función serverless para Netlify que maneja todas las rutas de la API
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { corsOptions } from '../../config/corsOptions.js';
import { errorHandler } from '../../middlewares/errorHandler.js';
import pool from '../../config/db.js';

const app = express();
app.use(cors(corsOptions)); // CORS seguro
app.use(express.json());

// Aplicar middlewares de seguridad directamente
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, intenta más tarde.'
}));

// Configurar pool de BD (puede ser null si no está configurada)
app.set('pool', pool);

// Importar routers
import clientesRoutes from '../../routes/clientes.js';
import camionesRoutes from '../../routes/camiones.js';
import diasEntregaRoutes from '../../routes/diasEntrega.js';
import camionesDiasRoutes from '../../routes/camionesDias.js';
import pingRoutes from '../../routes/ping.js';
import authRoutes from '../../routes/auth.js';
// import { swaggerUi, swaggerSpec } from '../../config/swagger.js';

// Usar las rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/camiones', camionesRoutes);
app.use('/api/dias_entrega', diasEntregaRoutes);
app.use('/api/camiones_dias', camionesDiasRoutes);
app.use('/api/ping', pingRoutes);
app.use('/api/auth', authRoutes);

// Swagger docs (comentado temporalmente para debug)
// app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Manejo centralizado de errores
app.use(errorHandler);

// Exportar como función serverless
export const handler = serverless(app);
