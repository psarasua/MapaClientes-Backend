// controllers/diasEntregaController.js
import { DiaEntregaModel } from '../models/diasEntregaModel.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responses.js';

export class DiasEntregaController {
  // Obtener todos los días de entrega con paginación
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';

      const result = await DiaEntregaModel.getAll({ page, limit, search });
      
      paginatedResponse(
        res, 
        result.data, 
        page, 
        limit, 
        result.total, 
        'Días de entrega obtenidos exitosamente',
      );
    } catch (error) {
      console.error('❌ Error al obtener días de entrega:', error);
      errorResponse(res, 'Error al obtener días de entrega', 500, error.message);
    }
  }

  // Obtener día de entrega por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de día de entrega inválido', 400);
      }

      const dia = await DiaEntregaModel.getById(id);

      if (!dia) {
        return errorResponse(res, 'Día de entrega no encontrado', 404);
      }

      successResponse(res, dia, 'Día de entrega obtenido exitosamente');
    } catch (error) {
      console.error('❌ Error al obtener día de entrega:', error);
      errorResponse(res, 'Error al obtener día de entrega', 500, error.message);
    }
  }

  // Crear nuevo día de entrega
  static async create(req, res) {
    try {
      const diaData = req.body;
      
      // Validar datos
      const validationErrors = DiasEntregaController.validateDiaEntrega(diaData);
      if (validationErrors.length > 0) {
        return errorResponse(res, 'Datos de día de entrega inválidos', 400, validationErrors);
      }

      const dia = await DiaEntregaModel.create(diaData);

      successResponse(res, dia, 'Día de entrega creado exitosamente', 201);
    } catch (error) {
      console.error('❌ Error al crear día de entrega:', error);
      
      // Error de clave única (PostgreSQL)
      if (error.code === '23505') {
        return errorResponse(res, 'Ya existe un día de entrega con esa descripción', 409);
      }
      
      errorResponse(res, 'Error al crear día de entrega', 500, error.message);
    }
  }

  // Actualizar día de entrega completo
  static async update(req, res) {
    try {
      const { id } = req.params;
      const diaData = req.body;

      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de día de entrega inválido', 400);
      }

      // Validar datos
      const validationErrors = DiasEntregaController.validateDiaEntrega(diaData);
      if (validationErrors.length > 0) {
        return errorResponse(res, 'Datos de día de entrega inválidos', 400, validationErrors);
      }

      const dia = await DiaEntregaModel.update(id, diaData);

      if (!dia) {
        return errorResponse(res, 'Día de entrega no encontrado', 404);
      }

      successResponse(res, dia, 'Día de entrega actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar día de entrega:', error);
      
      if (error.code === '23505') {
        return errorResponse(res, 'Ya existe un día de entrega con esa descripción', 409);
      }
      
      errorResponse(res, 'Error al actualizar día de entrega', 500, error.message);
    }
  }

  // Eliminar día de entrega
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de día de entrega inválido', 400);
      }

      // Verificar si el día está siendo usado
      const isUsed = await DiaEntregaModel.isUsed(id);
      if (isUsed) {
        return errorResponse(res, 'No se puede eliminar el día de entrega porque está siendo usado en asignaciones de camiones', 400);
      }

      const dia = await DiaEntregaModel.delete(id);

      if (!dia) {
        return errorResponse(res, 'Día de entrega no encontrado', 404);
      }

      successResponse(res, dia, 'Día de entrega eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar día de entrega:', error);
      
      if (error.code === '23503') {
        return errorResponse(res, 'No se puede eliminar el día de entrega porque está siendo usado en otras tablas', 400);
      }
      
      errorResponse(res, 'Error al eliminar día de entrega', 500, error.message);
    }
  }

  // Función de validación para días de entrega
  static validateDiaEntrega(diaData) {
    const errors = [];

    if (!diaData || typeof diaData !== 'object') {
      errors.push('Los datos del día son requeridos');
      return errors;
    }

    if (!diaData.descripcion || typeof diaData.descripcion !== 'string' || diaData.descripcion.trim() === '') {
      errors.push('La descripción es requerida y debe ser un texto válido');
    }

    if (diaData.descripcion && diaData.descripcion.length > 100) {
      errors.push('La descripción no puede exceder 100 caracteres');
    }

    return errors;
  }
}
