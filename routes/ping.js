// routes/ping.js
import express from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/responses.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Test de conexión a la base de datos
    const dbStart = Date.now();
    const result =
      await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
    const dbTime = Date.now() - dbStart;

    const response = {
      status: 'ok',
      environment: process.env.NODE_ENV || 'production',
      server: 'Netlify Functions',
      message: 'API funcionando correctamente',
      database: {
        status: 'connected',
        responseTime: `${dbTime}ms`,
        serverTime: result[0].current_time,
        version:
          result[0].db_version.split(' ')[0] +
          ' ' +
          result[0].db_version.split(' ')[1],
      },
      endpoints: {
        ping: '/api/ping',
        clientes: '/api/clientes',
        health: '/api/health',
      },
    };

    successResponse(res, response, '🏓 Pong! Sistema operativo');
  } catch (error) {
    console.error('❌ Error en ping:', error);

    const response = {
      status: 'ok',
      environment: process.env.NODE_ENV || 'production',
      server: 'Netlify Functions',
      message: 'API funcionando con problemas de BD',
      database: {
        status: 'disconnected',
        error: error.message,
      },
    };

    successResponse(res, response, '⚠️ API funcionando pero BD desconectada');
  }
});

export default router;
