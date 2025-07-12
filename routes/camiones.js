// routes/camiones.js
// Define las rutas para operaciones sobre camiones. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';

const router = express.Router();

// Ruta simple de prueba
router.get('/', (req, res) => {
  res.json({
    message: "Ruta de camiones funcionando",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
