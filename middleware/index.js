import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';

// Configuración de CORS optimizada
export const corsConfig = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mapaclientesbackend.netlify.app', 'https://mapaclientesfrontend.netlify.app']
    : ['http://localhost:3000', 'http://localhost:8888'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

// Configuración de rate limiting
export const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // límite por IP
  message: {
    success: false,
    error: 'Demasiadas peticiones desde esta IP, intenta más tarde',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuración de helmet para seguridad
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Configuración de compresión
export const compressionConfig = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Configuración de logging
export const morganConfig = morgan(
  process.env.NODE_ENV === 'production' 
    ? 'combined'
    : 'dev',
  {
    skip: (req, res) => req.url === '/health' || req.url === '/ping',
  },
);

// Middleware para parsing de JSON optimizado
export const jsonParser = (req, res, next) => {
  // Solo procesar JSON si es necesario
  if (req.method === 'GET' || req.method === 'DELETE') {
    return next();
  }
  
  // Verificar content-type
  if (!req.is('application/json')) {
    return res.status(415).json({
      success: false,
      error: 'Content-Type debe ser application/json',
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

// Middleware para headers de cache
export const cacheHeaders = (req, res, next) => {
  // Cache para endpoints de consulta
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutos
  } else {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
};

// Middleware para métricas de rendimiento
export const performanceMetrics = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const duration = process.hrtime.bigint() - start;
    const ms = Number(duration) / 1000000;
    
    // Log solo si es muy lento
    if (ms > 1000) {
      console.warn(`⚠️  Petición lenta: ${req.method} ${req.path} - ${ms.toFixed(2)}ms`);
    }
    
    // Agregar header de tiempo de respuesta
    res.set('X-Response-Time', `${ms.toFixed(2)}ms`);
  });
  
  next();
};

// Middleware consolidado de inicialización
export const setupMiddleware = (app) => {
  // Métricas de rendimiento
  app.use(performanceMetrics);
  
  // Seguridad
  app.use(helmetConfig);
  
  // Rate limiting
  app.use(rateLimitConfig);
  
  // Compresión
  app.use(compressionConfig);
  
  // Logging
  app.use(morganConfig);
  
  // CORS
  app.use(corsConfig);
  
  // Headers de cache
  app.use(cacheHeaders);
  
  // JSON parser optimizado
  app.use(jsonParser);
};
