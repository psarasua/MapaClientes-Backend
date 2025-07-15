// controllers/clientesController.js
import { ClienteModel } from '../models/clientesModel.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responses.js';
import { validateCliente, validateClienteUpdate } from '../utils/validation.js';

export class ClientesController {
  // Obtener todos los clientes con paginación
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const activo = req.query.activo;

      const result = await ClienteModel.getAll({ page, limit, search, activo });
      
      paginatedResponse(
        res, 
        result.data, 
        page, 
        limit, 
        result.total, 
        'Clientes obtenidos exitosamente',
      );
    } catch (error) {
      console.error('❌ Error al obtener clientes:', error);
      errorResponse(res, 'Error al obtener clientes', 500, error.message);
    }
  }

  // Obtener cliente por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de cliente inválido', 400);
      }

      const cliente = await ClienteModel.getById(id);

      if (!cliente) {
        return errorResponse(res, 'Cliente no encontrado', 404);
      }

      successResponse(res, cliente, 'Cliente obtenido exitosamente');
    } catch (error) {
      console.error('❌ Error al obtener cliente:', error);
      errorResponse(res, 'Error al obtener cliente', 500, error.message);
    }
  }

  // Crear nuevo cliente
  static async create(req, res) {
    try {
      const clienteData = req.body;
      
      // Validar datos
      const validationErrors = validateCliente(clienteData);
      if (validationErrors.length > 0) {
        return errorResponse(res, 'Datos de cliente inválidos', 400, validationErrors);
      }

      const cliente = await ClienteModel.create(clienteData);

      successResponse(res, cliente, 'Cliente creado exitosamente', 201);
    } catch (error) {
      console.error('❌ Error al crear cliente:', error);
      
      if (error.code === '23505') {
        return errorResponse(res, 'Ya existe un cliente con ese código alternativo', 409);
      }
      
      errorResponse(res, 'Error al crear cliente', 500, error.message);
    }
  }

  // Actualizar cliente completo
  static async update(req, res) {
    try {
      const { id } = req.params;
      const clienteData = req.body;

      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de cliente inválido', 400);
      }

      // Validar datos
      const validationErrors = validateCliente(clienteData);
      if (validationErrors.length > 0) {
        return errorResponse(res, 'Datos de cliente inválidos', 400, validationErrors);
      }

      const cliente = await ClienteModel.update(id, clienteData);

      if (!cliente) {
        return errorResponse(res, 'Cliente no encontrado', 404);
      }

      successResponse(res, cliente, 'Cliente actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar cliente:', error);
      errorResponse(res, 'Error al actualizar cliente', 500, error.message);
    }
  }

  // Actualizar cliente parcialmente
  static async patch(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de cliente inválido', 400);
      }

      if (Object.keys(updates).length === 0) {
        return errorResponse(res, 'No se proporcionaron datos para actualizar', 400);
      }

      // Validar solo los campos que se van a actualizar
      const validationErrors = validateClienteUpdate(updates);
      if (validationErrors.length > 0) {
        return errorResponse(res, 'Datos de cliente inválidos', 400, validationErrors);
      }

      const cliente = await ClienteModel.patch(id, updates);

      if (!cliente) {
        return errorResponse(res, 'Cliente no encontrado', 404);
      }

      successResponse(res, cliente, 'Cliente actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar cliente:', error);
      errorResponse(res, 'Error al actualizar cliente', 500, error.message);
    }
  }

  // Eliminar cliente
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de cliente inválido', 400);
      }

      const cliente = await ClienteModel.delete(id);

      if (!cliente) {
        return errorResponse(res, 'Cliente no encontrado', 404);
      }

      successResponse(res, cliente, 'Cliente eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      errorResponse(res, 'Error al eliminar cliente', 500, error.message);
    }
  }

  // Obtener solo la ubicación de un cliente
  static async getUbicacion(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return errorResponse(res, 'ID de cliente inválido', 400);
      }

      const ubicacion = await ClienteModel.getUbicacion(id);

      if (!ubicacion) {
        return errorResponse(res, 'Cliente no encontrado o sin ubicación', 404);
      }

      successResponse(res, ubicacion, 'Ubicación del cliente obtenida exitosamente');
    } catch (error) {
      console.error('❌ Error al obtener ubicación:', error);
      errorResponse(res, 'Error al obtener ubicación', 500, error.message);
    }
  }
}
