// middleware/logger.js
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`📝 ${timestamp} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Interceptar la respuesta para loggear el tiempo de respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`✅ ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    originalSend.call(this, data);
  };
  
  next();
};
