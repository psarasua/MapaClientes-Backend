// routes/ping.js
// Endpoint simple para chequeo de salud del backend (ping).
import express from 'express';
import { isDatabaseConfigured, getDatabaseErrorMessage } from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      configured: isDatabaseConfigured(),
      connected: false,
      error: null
    },
    server: 'Netlify Functions'
  };

  // Si se solicita verificación de BD con ?db=true
  if (req.query.db === 'true' || req.query.db === '1') {
    if (!isDatabaseConfigured()) {
      response.database.error = 'DATABASE_URL no configurada';
      return res.status(200).json(response);
    }

    try {
      const pool = req.app.get('pool');
      if (pool) {
        await pool.query('SELECT 1');
        response.database.connected = true;
      } else {
        response.database.error = 'Pool de conexiones no disponible';
      }
    } catch (err) {
      response.database.error = err.message;
    }
  }

  res.status(200).json(response);
});

export default router;
