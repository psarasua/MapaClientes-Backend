// routes/diasEntrega.js
// Define las rutas para operaciones sobre días de entrega. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { getDiasEntrega } from '../controllers/diasEntregaController.js';
import { requireDatabase } from '../middlewares/checkDatabase.js';
const router = express.Router();

// Ruta para obtener los días de entrega (requiere BD)
router.get('/', requireDatabase, getDiasEntrega);

export default router;
