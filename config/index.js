import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la aplicación
export const config = {
  // Configuración del servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Configuración de la base de datos
  database: {
    url: process.env.DATABASE_URL,
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  },

  // Configuración de CORS
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? [
          'https://mapaclientesbackend.netlify.app',
          'https://mapaclientesfrontend.netlify.app',
        ]
        : ['http://localhost:3000', 'http://localhost:8888'],
    credentials: true,
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  },

  // Configuración de paginación
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },

  // Configuración de seguridad
  security: {
    bcryptRounds: 12,
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  },
};

// Validar configuración crítica
export const validateConfig = () => {
  const errors = [];

  if (!config.database.url) {
    errors.push('DATABASE_URL es requerida');
  }

  if (
    config.nodeEnv === 'production' &&
    config.security.jwtSecret === 'fallback-secret'
  ) {
    errors.push('JWT_SECRET debe ser configurado en producción');
  }

  if (errors.length > 0) {
    throw new Error(`Errores de configuración: ${errors.join(', ')}`);
  }
};

// Modo de desarrollo
export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
