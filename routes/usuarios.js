// routes/usuarios.js
import express from 'express';
import usuariosController from '../controllers/usuariosController.js';
import { successResponse } from '../utils/responses.js';

const router = express.Router();

// Ruta base para usuarios
router.get('/', (req, res) => {
  successResponse(res, 'API de Usuarios - MapaClientes', {
    version: '1.0.0',
    endpoints: {
      'GET /usuarios/users': 'Obtener todos los usuarios',
      'GET /usuarios/:id': 'Obtener usuario por ID',
      'POST /usuarios': 'Crear nuevo usuario',
      'PUT /usuarios/:id': 'Actualizar usuario',
      'DELETE /usuarios/:id': 'Eliminar usuario',
      'POST /usuarios/login': 'Login de usuario',
      'PUT /usuarios/:id/password': 'Cambiar contraseña',
      'GET /usuarios/stats': 'Obtener estadísticas',
    },
  });
});

// Rutas de usuarios
router.get('/users', usuariosController.getUsuarios);
router.get('/stats', usuariosController.getEstadisticas);
router.get('/:id', usuariosController.getUsuario);
router.post('/', usuariosController.createUsuario);
router.put('/:id', usuariosController.updateUsuario);
router.delete('/:id', usuariosController.deleteUsuario);

// Rutas de autenticación
router.post('/login', usuariosController.login);
router.put('/:id/password', usuariosController.cambiarPassword);

export default router;
