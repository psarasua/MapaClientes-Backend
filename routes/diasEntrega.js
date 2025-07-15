// routes/diasEntrega.js
import express from 'express';
import { 
  getAllDiasEntrega, 
  getDiaEntregaById, 
  createDiaEntrega, 
  updateDiaEntrega, 
  deleteDiaEntrega,
} from '../controllers/diasEntregaController.js';

const router = express.Router();

// GET /api/dias-entrega - Obtener todos los días de entrega con paginación
router.get('/', getAllDiasEntrega);

// GET /api/dias-entrega/:id - Obtener día de entrega por ID
router.get('/:id', getDiaEntregaById);

// POST /api/dias-entrega - Crear nuevo día de entrega
router.post('/', createDiaEntrega);

// PUT /api/dias-entrega/:id - Actualizar día de entrega completo
router.put('/:id', updateDiaEntrega);

// DELETE /api/dias-entrega/:id - Eliminar día de entrega
router.delete('/:id', deleteDiaEntrega);

export default router;
