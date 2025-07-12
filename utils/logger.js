// utils/logger.js
// Logger avanzado con winston para registrar eventos y errores en el servidor.

import winston from 'winston';

// Configuración simplificada para entornos serverless
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// En Netlify/serverless, solo usamos console logging
// No intentamos crear archivos de log para evitar errores ENOENT

export default logger;
