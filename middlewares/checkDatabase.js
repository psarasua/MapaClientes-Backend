// middlewares/checkDatabase.js
// Middleware para verificar si hay conexión a la base de datos antes de procesar rutas que la requieren

import { isDatabaseConfigured, getDatabaseErrorMessage } from '../config/db.js';

export const requireDatabase = (req, res, next) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).json(getDatabaseErrorMessage());
  }
  
  const pool = req.app.get('pool');
  if (!pool) {
    return res.status(503).json(getDatabaseErrorMessage());
  }
  
  next();
};

export const checkDatabaseConnection = async (req, res, next) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).json(getDatabaseErrorMessage());
  }
  
  const pool = req.app.get('pool');
  if (!pool) {
    return res.status(503).json(getDatabaseErrorMessage());
  }
  
  try {
    // Test rápido de conexión
    await pool.query('SELECT 1');
    next();
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error.message);
    return res.status(503).json({
      error: {
        code: 503,
        message: "Error de conexión a la base de datos",
        details: "No se pudo conectar a la base de datos. Verifica la configuración.",
        technical: error.message
      }
    });
  }
};
