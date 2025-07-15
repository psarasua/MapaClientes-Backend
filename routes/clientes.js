// routes/clientes.js
import express from 'express';
import { 
  getAllClientes, 
  getClienteById, 
  createCliente, 
  updateCliente, 
  patchCliente, 
  deleteCliente, 
  getClienteUbicacion,
} from '../controllers/clientesController.js';

const router = express.Router();

// GET /api/clientes - Obtener todos los clientes con paginación
router.get('/', getAllClientes);

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', getClienteById);

// POST /api/clientes - Crear nuevo cliente
router.post('/', createCliente);

// PUT /api/clientes/:id - Actualizar cliente completo
router.put('/:id', updateCliente);

// PATCH /api/clientes/:id - Actualizar cliente parcialmente
router.patch('/:id', patchCliente);

// DELETE /api/clientes/:id - Eliminar cliente
router.delete('/:id', deleteCliente);

// GET /api/clientes/:id/ubicacion - Obtener solo la ubicación de un cliente
router.get('/:id/ubicacion', getClienteUbicacion);

export default router;
