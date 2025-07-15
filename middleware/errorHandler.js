// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Error de base de datos
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      error: 'Error de integridad de datos',
      message: 'Los datos proporcionados no cumplen con las restricciones',
      timestamp: new Date().toISOString(),
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Error interno del servidor
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? 'Algo salió mal' : err.message,
    timestamp: new Date().toISOString(),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Recurso no encontrado',
    message: `La ruta ${req.originalUrl} no existe`,
    timestamp: new Date().toISOString(),
  });
};
