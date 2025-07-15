import { successResponse, errorResponse } from '../utils/responses.js';
import { validatePagination } from '../utils/validation.js';

// Clase base para controladores CRUD
export class BaseController {
  constructor(model, entityName) {
    this.model = model;
    this.entityName = entityName;
  }

  // Obtener todos los registros
  getAll = async (req, res) => {
    try {
      const validation = validatePagination(req.query);
      if (!validation.isValid) {
        return errorResponse(res, 'Parámetros de consulta inválidos', validation.errors, 400);
      }

      const result = await this.model.getAll(validation.data);
      
      return successResponse(res, {
        data: result.data,
        pagination: {
          page: validation.data.page,
          limit: validation.data.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / validation.data.limit),
        },
      }, `${this.entityName} obtenidos exitosamente`);
    } catch (error) {
      console.error(`❌ Error al obtener ${this.entityName.toLowerCase()}:`, error);
      return errorResponse(res, `Error al obtener ${this.entityName.toLowerCase()}`, null, 500);
    }
  };

  // Obtener por ID
  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id);
      
      if (isNaN(numericId) || numericId <= 0) {
        return errorResponse(res, 'ID inválido', null, 400);
      }

      const record = await this.model.getById(numericId);
      
      if (!record) {
        return errorResponse(res, `${this.entityName} no encontrado`, null, 404);
      }

      return successResponse(res, record, `${this.entityName} obtenido exitosamente`);
    } catch (error) {
      console.error(`❌ Error al obtener ${this.entityName.toLowerCase()}:`, error);
      return errorResponse(res, `Error al obtener ${this.entityName.toLowerCase()}`, null, 500);
    }
  };

  // Crear
  create = async (req, res) => {
    try {
      const newRecord = await this.model.create(req.body);
      return successResponse(res, newRecord, `${this.entityName} creado exitosamente`, 201);
    } catch (error) {
      console.error(`❌ Error al crear ${this.entityName.toLowerCase()}:`, error);
      return errorResponse(res, `Error al crear ${this.entityName.toLowerCase()}`, null, 500);
    }
  };

  // Actualizar
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id);
      
      if (isNaN(numericId) || numericId <= 0) {
        return errorResponse(res, 'ID inválido', null, 400);
      }

      const updatedRecord = await this.model.update(numericId, req.body);
      
      if (!updatedRecord) {
        return errorResponse(res, `${this.entityName} no encontrado`, null, 404);
      }

      return successResponse(res, updatedRecord, `${this.entityName} actualizado exitosamente`);
    } catch (error) {
      console.error(`❌ Error al actualizar ${this.entityName.toLowerCase()}:`, error);
      return errorResponse(res, `Error al actualizar ${this.entityName.toLowerCase()}`, null, 500);
    }
  };

  // Eliminar
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id);
      
      if (isNaN(numericId) || numericId <= 0) {
        return errorResponse(res, 'ID inválido', null, 400);
      }

      // Verificar si está siendo usado (si el modelo tiene esta función)
      if (this.model.isUsed) {
        const isUsed = await this.model.isUsed(numericId);
        if (isUsed) {
          return errorResponse(res, `No se puede eliminar el ${this.entityName.toLowerCase()} porque está siendo usado`, null, 400);
        }
      }

      const deletedRecord = await this.model.delete(numericId);
      
      if (!deletedRecord) {
        return errorResponse(res, `${this.entityName} no encontrado`, null, 404);
      }

      return successResponse(res, deletedRecord, `${this.entityName} eliminado exitosamente`);
    } catch (error) {
      console.error(`❌ Error al eliminar ${this.entityName.toLowerCase()}:`, error);
      return errorResponse(res, `Error al eliminar ${this.entityName.toLowerCase()}`, null, 500);
    }
  };
}

// Función factory para crear controladores CRUD estándar
export const createCrudController = (model, entityName) => {
  return new BaseController(model, entityName);
};
