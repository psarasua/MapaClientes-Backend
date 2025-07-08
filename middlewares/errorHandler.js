// middlewares/errorHandler.js
// Middleware para manejo centralizado de errores. Captura errores y responde de forma segura.
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message, { url: req.originalUrl, method: req.method });
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: status,
      message: err.message || 'Error interno del servidor',
      details: err.details || undefined
    }
  });
}
