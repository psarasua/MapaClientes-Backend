// middlewares/security.js
// Middleware para aplicar cabeceras de seguridad y protección contra ataques comunes.
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const applySecurity = [
  helmet(),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    message: 'Demasiadas peticiones desde esta IP, intenta más tarde.'
  })
];
