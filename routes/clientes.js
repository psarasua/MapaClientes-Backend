// routes/clientes.js
import express from 'express';
import { ClientesController } from '../controllers/clientesController.js';

const router = express.Router();

// GET /api/clientes - Obtener todos los clientes con paginación
router.get('/', ClientesController.getAll);

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', ClientesController.getById);

// POST /api/clientes - Crear nuevo cliente
router.post('/', ClientesController.create);

// PUT /api/clientes/:id - Actualizar cliente completo
router.put('/:id', ClientesController.update);

// PATCH /api/clientes/:id - Actualizar cliente parcialmente
router.patch('/:id', ClientesController.patch);

// DELETE /api/clientes/:id - Eliminar cliente
router.delete('/:id', ClientesController.delete);

// GET /api/clientes/:id/ubicacion - Obtener solo la ubicación de un cliente
router.get('/:id/ubicacion', ClientesController.getUbicacion);

export default router;
