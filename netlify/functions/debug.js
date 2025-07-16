// netlify/functions/debug.js
import express from 'express';
import serverless from 'serverless-http';

const app = express();

app.use(express.json());

app.get('/debug', async (req, res) => {
  try {
    // Intentar importar las rutas para ver si hay errores
    const imports = {};
    const errors = {};

    try {
      const { default: camionesRoutes } = await import('../../routes/camiones.js');
      imports.camiones = typeof camionesRoutes;
    } catch (error) {
      errors.camiones = error.message;
    }

    try {
      const { default: clientesRoutes } = await import('../../routes/clientes.js');
      imports.clientes = typeof clientesRoutes;
    } catch (error) {
      errors.clientes = error.message;
    }

    try {
      const { default: diasEntregaRoutes } = await import('../../routes/diasEntrega.js');
      imports.diasEntrega = typeof diasEntregaRoutes;
    } catch (error) {
      errors.diasEntrega = error.message;
    }

    try {
      const { default: healthRoutes } = await import('../../routes/health.js');
      imports.health = typeof healthRoutes;
    } catch (error) {
      errors.health = error.message;
    }

    try {
      const { default: pingRoutes } = await import('../../routes/ping.js');
      imports.ping = typeof pingRoutes;
    } catch (error) {
      errors.ping = error.message;
    }

    res.json({
      success: true,
      message: 'Diagnóstico de importaciones',
      imports,
      errors,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en diagnóstico',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export const handler = serverless(app);
