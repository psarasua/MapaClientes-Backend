// routes/camiones.js
import express from 'express';
import { CamionesController } from '../controllers/camionesController.js';

const router = express.Router();

// GET /api/camiones - Obtener todos los camiones con paginación
router.get('/', CamionesController.getAll);

// GET /api/camiones/:id - Obtener camión por ID
router.get('/:id', CamionesController.getById);

// POST /api/camiones - Crear nuevo camión
router.post('/', CamionesController.create);

// PUT /api/camiones/:id - Actualizar camión completo
router.put('/:id', CamionesController.update);

// DELETE /api/camiones/:id - Eliminar camión
router.delete('/:id', CamionesController.delete);

export default router;
