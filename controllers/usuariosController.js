// controllers/usuariosController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import usuariosModel from '../models/usuariosModel.js';
import { successResponse, errorResponse } from '../utils/responses.js';

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu-super-secreto-jwt-key-aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const usuariosController = {
  // Obtener todos los usuarios
  async getUsuarios(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search || '',
        rol: req.query.rol || '',
        activo: req.query.activo || '',
      };

      const result = await usuariosModel.getAll(filters);
      
      successResponse(res, 'Usuarios obtenidos exitosamente', result, 200);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      errorResponse(res, 'Error al obtener usuarios', 500);
    }
  },

  // Obtener usuario por ID
  async getUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuariosModel.getById(id);

      if (!usuario) {
        return errorResponse(res, 'Usuario no encontrado', 404);
      }

      successResponse(res, 'Usuario obtenido exitosamente', usuario, 200);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      errorResponse(res, 'Error al obtener usuario', 500);
    }
  },

  // Crear nuevo usuario
  async createUsuario(req, res) {
    try {
      const { email, password, nombre, apellido, rol = 'user' } = req.body;

      // Validaciones
      if (!email || !password || !nombre || !apellido) {
        return errorResponse(res, 'Email, password, nombre y apellido son requeridos', 400);
      }

      // Verificar si el email ya existe
      const existeEmail = await usuariosModel.existsByEmail(email);
      if (existeEmail) {
        return errorResponse(res, 'El email ya está registrado', 409);
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return errorResponse(res, 'Formato de email inválido', 400);
      }

      // Validar longitud de password
      if (password.length < 6) {
        return errorResponse(res, 'La contraseña debe tener al menos 6 caracteres', 400);
      }

      // Validar rol
      const rolesValidos = ['user', 'admin', 'super_admin'];
      if (!rolesValidos.includes(rol)) {
        return errorResponse(res, 'Rol inválido', 400);
      }

      // Encriptar password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario
      const nuevoUsuario = await usuariosModel.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        nombre,
        apellido,
        rol,
      });

      successResponse(res, 'Usuario creado exitosamente', nuevoUsuario, 201);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      errorResponse(res, 'Error al crear usuario', 500);
    }
  },

  // Actualizar usuario
  async updateUsuario(req, res) {
    try {
      const { id } = req.params;
      const { email, nombre, apellido, rol, activo } = req.body;

      // Verificar si el usuario existe
      const usuarioExistente = await usuariosModel.getById(id);
      if (!usuarioExistente) {
        return errorResponse(res, 'Usuario no encontrado', 404);
      }

      const updateData = {};

      // Validar y actualizar email
      if (email && email !== usuarioExistente.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return errorResponse(res, 'Formato de email inválido', 400);
        }

        const existeEmail = await usuariosModel.existsByEmail(email, id);
        if (existeEmail) {
          return errorResponse(res, 'El email ya está registrado', 409);
        }

        updateData.email = email.toLowerCase();
      }

      // Actualizar otros campos
      if (nombre) updateData.nombre = nombre;
      if (apellido) updateData.apellido = apellido;
      if (typeof activo === 'boolean') updateData.activo = activo;

      // Validar rol
      if (rol) {
        const rolesValidos = ['user', 'admin', 'super_admin'];
        if (!rolesValidos.includes(rol)) {
          return errorResponse(res, 'Rol inválido', 400);
        }
        updateData.rol = rol;
      }

      const usuarioActualizado = await usuariosModel.update(id, updateData);

      successResponse(res, 'Usuario actualizado exitosamente', usuarioActualizado, 200);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      errorResponse(res, 'Error al actualizar usuario', 500);
    }
  },

  // Eliminar usuario (soft delete)
  async deleteUsuario(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el usuario existe
      const usuarioExistente = await usuariosModel.getById(id);
      if (!usuarioExistente) {
        return errorResponse(res, 'Usuario no encontrado', 404);
      }

      await usuariosModel.delete(id);

      successResponse(res, 'Usuario eliminado exitosamente', null, 200);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      errorResponse(res, 'Error al eliminar usuario', 500);
    }
  },

  // Login de usuario
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones
      if (!email || !password) {
        return errorResponse(res, 'Email y password son requeridos', 400);
      }

      // Buscar usuario por email
      const usuario = await usuariosModel.getByEmail(email.toLowerCase());
      if (!usuario) {
        return errorResponse(res, 'Credenciales inválidas', 401);
      }

      // Verificar si el usuario está activo
      if (!usuario.activo) {
        return errorResponse(res, 'Usuario inactivo', 401);
      }

      // Verificar password
      const passwordValida = await bcrypt.compare(password, usuario.password);
      if (!passwordValida) {
        return errorResponse(res, 'Credenciales inválidas', 401);
      }

      // Actualizar último login
      await usuariosModel.updateLastLogin(usuario.id);

      // Generar JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          rol: usuario.rol,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      // Datos del usuario para respuesta (sin password)
      const userData = {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        lastLogin: new Date(),
      };

      successResponse(res, 'Login exitoso', { 
        usuario: userData, 
        token,
        expiresIn: JWT_EXPIRES_IN,
      }, 200);
    } catch (error) {
      console.error('Error en login:', error);
      errorResponse(res, 'Error en login', 500);
    }
  },

  // Cambiar contraseña
  async cambiarPassword(req, res) {
    try {
      const { id } = req.params;
      const { passwordActual, passwordNueva } = req.body;

      // Validaciones
      if (!passwordActual || !passwordNueva) {
        return errorResponse(res, 'Password actual y nueva son requeridos', 400);
      }

      if (passwordNueva.length < 6) {
        return errorResponse(res, 'La nueva contraseña debe tener al menos 6 caracteres', 400);
      }

      // Buscar usuario
      const usuario = await usuariosModel.getByEmail(req.user?.email);
      if (!usuario || usuario.id !== parseInt(id)) {
        return errorResponse(res, 'Usuario no encontrado', 404);
      }

      // Verificar password actual
      const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
      if (!passwordValida) {
        return errorResponse(res, 'Contraseña actual incorrecta', 401);
      }

      // Encriptar nueva password
      const hashedPassword = await bcrypt.hash(passwordNueva, 12);

      // Actualizar password
      await usuariosModel.update(id, { password: hashedPassword });

      successResponse(res, 'Contraseña actualizada exitosamente', null, 200);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      errorResponse(res, 'Error al cambiar contraseña', 500);
    }
  },

  // Obtener estadísticas de usuarios
  async getEstadisticas(req, res) {
    try {
      const stats = await usuariosModel.getStats();
      successResponse(res, 'Estadísticas obtenidas exitosamente', stats, 200);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      errorResponse(res, 'Error al obtener estadísticas', 500);
    }
  },
};

export default usuariosController;
