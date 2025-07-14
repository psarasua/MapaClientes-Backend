// routes/health.js
import express from 'express';
import pool from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responses.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'Sistema saludable',
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Verificar base de datos
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbTime = Date.now() - dbStart;
    
    healthCheck.services.database = {
      status: 'healthy',
      responseTime: `${dbTime}ms`
    };
  } catch (error) {
    healthCheck.services.database = {
      status: 'unhealthy',
      error: error.message
    };
    healthCheck.message = 'Sistema con problemas';
  }

  // Verificar memoria
  const memoryUsage = process.memoryUsage();
  healthCheck.services.memory = {
    status: 'healthy',
    usage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    }
  };

  const isHealthy = healthCheck.services.database.status === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  if (isHealthy) {
    successResponse(res, healthCheck, '✅ Sistema completamente saludable', statusCode);
  } else {
    errorResponse(res, '⚠️ Sistema con problemas', statusCode, healthCheck);
  }
});

export default router;
