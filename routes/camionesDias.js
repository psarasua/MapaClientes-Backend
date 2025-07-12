// routes/camionesDias.js
// Define las rutas para operaciones sobre la asignación de camiones a días. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { requireDatabase } from '../middlewares/checkDatabase.js';

const router = express.Router();

// Rutas que requieren BD
router.get('/', requireDatabase, (req, res) => {
  res.json({
    message: "Endpoint de camiones-días funcionando",
    note: "Base de datos configurada pero sin datos reales todavía",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

router.get('/asignados/:camion_dia', requireDatabase, (req, res) => {
  res.json({
    message: "Endpoint de clientes asignados funcionando",
    camion_dia: req.params.camion_dia,
    note: "Base de datos configurada pero sin datos reales todavía",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
