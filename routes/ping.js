// routes/ping.js
import express from 'express';
import pool from '../netlify/functions/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbMessage = 'No se pudo conectar a la base de datos';
  
  try {
    // Probar la conexión a la base de datos
    const result = await pool.query('SELECT NOW() as current_time');
    dbStatus = 'connected';
    dbMessage = `Conectado a la base de datos. Hora del servidor: ${result.rows[0].current_time}`;
  } catch (error) {
    dbMessage = `Error de conexión: ${error.message}`;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Netlify Functions',
    message: 'Pong!',
    database: {
      status: dbStatus,
      message: dbMessage
    }
  });
});

export default router;
