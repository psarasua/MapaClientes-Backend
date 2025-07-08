// index.js
// Punto de entrada principal del backend. Configura middlewares, rutas, seguridad y arranca el servidor.
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/corsOptions.js';
import { applySecurity } from './middlewares/security.js';
import { errorHandler } from './middlewares/errorHandler.js';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors(corsOptions)); // CORS seguro
app.use(express.json());
app.use(...applySecurity); // Seguridad

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
app.set('pool', pool);

// Importar routers
import clientesRoutes from './routes/clientes.js';
import camionesRoutes from './routes/camiones.js';
import diasEntregaRoutes from './routes/diasEntrega.js';
import camionesDiasRoutes from './routes/camionesDias.js';
import pingRoutes from './routes/ping.js';
import authRoutes from './routes/auth.js';
import { swaggerUi, swaggerSpec } from './config/swagger.js';

// Usar las rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/camiones', camionesRoutes);
app.use('/api/dias_entrega', diasEntregaRoutes);
app.use('/api/camiones_dias', camionesDiasRoutes);
app.use('/api/ping', pingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Manejo centralizado de errores
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
