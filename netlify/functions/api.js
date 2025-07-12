// netlify/functions/api.js
import express from 'express';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente', 
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
});

// Ruta de ping simple
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'netlify',
    message: 'Pong!'
  });
});

// Ruta de clientes simple
app.get('/api/clientes', (req, res) => {
  res.json({
    message: "No hay conexión a la base de datos",
    error: "DATABASE_URL no está configurada",
    status: "database_not_configured",
    timestamp: new Date().toISOString()
  });
});

export const handler = serverless(app);
