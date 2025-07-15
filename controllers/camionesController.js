// controllers/camionesController.js
import { CamionModel } from '../models/camionesModel.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responses.js';

export class CamionesController {
  // Obtener todos los camiones con paginación
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await CamionModel.getAll({ page, limit, search });
      
      paginatedResponse(
        res, 
        result.data, 
        page, 
        limit, 
        result.total, 
        'Camiones obtenidos exitosamente',
      );
    } catch (error) {
      console.error('❌ Error al obtener camiones:', error);
      errorResponse(res, 'Error al obtener camiones', 500, error.message);
    }
  }

  // Obtener camión por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de camión inválido', 400);
      }

      const camion = await CamionModel.getById(id);

      if (!camion) {
        return errorResponse(res, 'Camión no encontrado', 404);
      }

      successResponse(res, camion, 'Camión obtenido exitosamente');
    } catch (error) {
      console.error('❌ Error al obtener camión:', error);
      errorResponse(res, 'Error al obtener camión', 500, error.message);
    }
  }

  // Crear nuevo camión
  static async create(req, res) {
    try {
      const camionData = req.body;
      
      // Validar datos
      const validationErrors = CamionesController.validateCamion(camionData);
      if (validationErrors.length > 0) {
        return errorResponse(res, 'Datos de camión inválidos', 400, validationErrors);
      }

      const camion = await CamionModel.create(camionData);

      successResponse(res, camion, 'Camión creado exitosamente', 201);
    } catch (error) {
      console.error('❌ Error al crear camión:', error);
      
      // Error de clave única (PostgreSQL)
      if (error.code === '23505') {
        return errorResponse(res, 'Ya existe un camión con esa descripción', 409);
      }
      
      errorResponse(res, 'Error al crear camión', 500, error.message);
    }
  }

  // Actualizar camión completo
  static async update(req, res) {
    try {
      const { id } = req.params;
      const camionData = req.body;

      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de camión inválido', 400);
      }

      // Validar datos
      const validationErrors = CamionesController.validateCamion(camionData);
      if (validationErrors.length > 0) {
        return errorResponse(res, 'Datos de camión inválidos', 400, validationErrors);
      }

      const camion = await CamionModel.update(id, camionData);

      if (!camion) {
        return errorResponse(res, 'Camión no encontrado', 404);
      }

      successResponse(res, camion, 'Camión actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar camión:', error);
      
      if (error.code === '23505') {
        return errorResponse(res, 'Ya existe un camión con esa descripción', 409);
      }
      
      errorResponse(res, 'Error al actualizar camión', 500, error.message);
    }
  }

  // Eliminar camión
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de camión inválido', 400);
      }

      // Verificar si el camión está siendo usado
      const isUsed = await CamionModel.isUsed(id);
      if (isUsed) {
        return errorResponse(res, 'No se puede eliminar el camión porque está siendo usado en asignaciones de días', 400);
      }

      const camion = await CamionModel.delete(id);

      if (!camion) {
        return errorResponse(res, 'Camión no encontrado', 404);
      }

      successResponse(res, camion, 'Camión eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar camión:', error);
      
      if (error.code === '23503') {
        return errorResponse(res, 'No se puede eliminar el camión porque está siendo usado en otras tablas', 400);
      }
      
      errorResponse(res, 'Error al eliminar camión', 500, error.message);
    }
  }

  // Función de validación para camiones
  static validateCamion(camionData) {
    const errors = [];

    if (!camionData || typeof camionData !== 'object') {
      errors.push('Los datos del camión son requeridos');
      return errors;
    }

    if (!camionData.descripcion || typeof camionData.descripcion !== 'string' || camionData.descripcion.trim() === '') {
      errors.push('La descripción es requerida y debe ser un texto válido');
    }

    if (camionData.descripcion && camionData.descripcion.length > 255) {
      errors.push('La descripción no puede exceder 255 caracteres');
    }

    return errors;
  }
}
