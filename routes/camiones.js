// routes/camiones.js
import express from 'express';
import { 
  getAllCamiones, 
  getCamionById, 
  createCamion, 
  updateCamion, 
  deleteCamion,
  testCamion,
} from '../controllers/camionesController.js';

const router = express.Router();

// GET /api/camiones - Obtener todos los camiones con paginación
router.get('/', getAllCamiones);

// GET /api/camiones/:id - Obtener camión por ID
router.get('/:id', getCamionById);

// POST /api/camiones - Crear nuevo camión
router.post('/', createCamion);

// PUT /api/camiones/:id - Actualizar camión completo
router.put('/:id', updateCamion);

// DELETE /api/camiones/:id - Eliminar camión
router.delete('/:id', deleteCamion);

// POST /api/camiones/test - Endpoint de prueba para debugging
router.post('/test', testCamion);

export default router;
