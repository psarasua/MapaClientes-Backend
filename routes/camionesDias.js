// routes/camionesDias.js
// Define las rutas para operaciones sobre la asignación de camiones a días. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { getCamionesDias, getClientesAsignados } from '../controllers/camionesDiasController.js';
import { requireDatabase } from '../middlewares/checkDatabase.js';

const router = express.Router();

router.get('/', requireDatabase, getCamionesDias);
router.get('/asignados/:camion_dia', requireDatabase, getClientesAsignados);

export default router;
