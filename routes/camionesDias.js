// routes/camionesDias.js
// Define las rutas para operaciones sobre la asignación de camiones a días. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';

const router = express.Router();

// Rutas simples de prueba
router.get('/', (req, res) => {
  res.json({
    message: "Ruta de camiones-días funcionando",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

router.get('/asignados/:camion_dia', (req, res) => {
  res.json({
    message: "Ruta de clientes asignados funcionando",
    camion_dia: req.params.camion_dia,
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
