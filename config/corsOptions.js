// config/corsOptions.js
// Configuración de CORS para restringir orígenes permitidos y mejorar la seguridad.
const allowedOrigins = [
  'http://localhost:5173', // para desarrollo local
  'https://mapas-clientes-front.onrender.com', // tu frontend en producción
];

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
};
