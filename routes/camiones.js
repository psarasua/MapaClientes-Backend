// routes/camiones.js
// Define las rutas para operaciones sobre camiones. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { getCamiones } from '../controllers/camionesController.js';
const router = express.Router();

// Ruta para obtener la lista de camiones
router.get('/', getCamiones);

export default router;
