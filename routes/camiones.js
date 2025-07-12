// routes/camiones.js
// Define las rutas para operaciones sobre camiones. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { requireDatabase } from '../middlewares/checkDatabase.js';

const router = express.Router();

// Ruta para obtener la lista de camiones (requiere BD)
router.get('/', requireDatabase, (req, res) => {
  res.json({
    message: "Endpoint de camiones funcionando",
    note: "Base de datos configurada pero sin datos reales todavía",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
