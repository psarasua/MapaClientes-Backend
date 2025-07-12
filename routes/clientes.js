// routes/clientes.js
// Define las rutas para operaciones sobre clientes. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { requireDatabase } from '../middlewares/checkDatabase.js';

const router = express.Router();

// Obtener todos los clientes (requiere BD)
router.get('/', requireDatabase, (req, res) => {
  // Si llegamos aquí, la BD está configurada
  res.json({
    message: "Endpoint de clientes funcionando",
    note: "Base de datos configurada pero sin datos reales todavía",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
