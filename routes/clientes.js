// routes/clientes.js
// Define las rutas para operaciones sobre clientes. Conecta las rutas HTTP con el controlador correspondiente.
import express from 'express';
import { getClientes } from '../controllers/clientesController.js';
import verifyToken from '../middlewares/verifyToken.js';
const router = express.Router();

// Obtener todos los clientes (protegido)
router.get('/', verifyToken, getClientes);

export default router;
