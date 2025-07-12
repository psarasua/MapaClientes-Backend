// routes/diasEntrega.js
// Define las rutas para operaciones sobre días de entrega. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { requireDatabase } from '../middlewares/checkDatabase.js';

const router = express.Router();

// Ruta para obtener los días de entrega (requiere BD)
router.get('/', requireDatabase, (req, res) => {
  res.json({
    message: "Endpoint de días de entrega funcionando",
    note: "Base de datos configurada pero sin datos reales todavía",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
