// routes/diasEntrega.js
import express from 'express';
import { DiasEntregaController } from '../controllers/diasEntregaController.js';

const router = express.Router();

// GET /api/dias-entrega - Obtener todos los días de entrega con paginación
router.get('/', DiasEntregaController.getAll);

// GET /api/dias-entrega/:id - Obtener día de entrega por ID
router.get('/:id', DiasEntregaController.getById);

// POST /api/dias-entrega - Crear nuevo día de entrega
router.post('/', DiasEntregaController.create);

// PUT /api/dias-entrega/:id - Actualizar día de entrega completo
router.put('/:id', DiasEntregaController.update);

// DELETE /api/dias-entrega/:id - Eliminar día de entrega
router.delete('/:id', DiasEntregaController.delete);

export default router;
