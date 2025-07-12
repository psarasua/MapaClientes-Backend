// netlify/functions/api.js
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

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

// Ruta de ping
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    server: 'Netlify Functions',
    message: 'Pong!'
  });
});

// Rutas de clientes
app.get('/api/clientes', (req, res) => {
  res.json({
    message: "Endpoint de clientes funcionando",
    data: [],
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.post('/api/clientes', (req, res) => {
  res.json({
    message: "Cliente creado (simulado)",
    data: { id: 1, ...req.body },
    status: "created",
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
