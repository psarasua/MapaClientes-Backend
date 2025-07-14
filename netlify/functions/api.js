// netlify/functions/api.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import pingRouter from '../../routes/ping.js';
import clientesRouter from '../../routes/clientes.js';

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta principal de información
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

// Usar las rutas importadas
app.use('/api/ping', pingRouter);
app.use('/api/clientes', clientesRouter);

export const handler = serverless(app);
