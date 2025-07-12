// routes/camiones.js
// Define las rutas para operaciones sobre camiones. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { getCamiones } from '../controllers/camionesController.js';
import { requireDatabase } from '../middlewares/checkDatabase.js';

const router = express.Router();

// Ruta para obtener la lista de camiones (requiere BD)
router.get('/', requireDatabase, getCamiones);

export default router;
