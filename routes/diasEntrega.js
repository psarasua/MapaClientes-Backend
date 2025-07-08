// routes/diasEntrega.js
// Define las rutas para operaciones sobre días de entrega. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { getDiasEntrega } from '../controllers/diasEntregaController.js';
const router = express.Router();

// Ruta para obtener los días de entrega
router.get('/', getDiasEntrega);

export default router;
