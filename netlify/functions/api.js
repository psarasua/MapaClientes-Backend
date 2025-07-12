// netlify/functions/api.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

// Importar rutas
import clientesRoutes from '../../routes/clientes.js';
import pingRoutes from '../../routes/ping.js';

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/clientes', clientesRoutes);
app.use('/api/ping', pingRoutes);

// Ruta de bienvenida
app.get('/api', (req, res) => {
  res.json({
    message: 'API MapaClientes funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      ping: '/api/ping',
      clientes: '/api/clientes'
    },
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: 'La ruta solicitada no existe',
    timestamp: new Date().toISOString()
  });
});

export const handler = serverless(app);
