import {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  getClientesActivos,
  searchClientes,
} from '../models/clientesModel.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export const getAllClientesController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', activo } = req.query;

    const result = await getAllClientes({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      activo,
    });

    successResponse(res, result, 'Clientes obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getClienteByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await getClienteById(id);

    successResponse(res, cliente, 'Cliente obtenido exitosamente');
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const createClienteController = async (req, res) => {
  try {
    const nuevoCliente = await createCliente(req.body);
    successResponse(res, nuevoCliente, 'Cliente creado exitosamente', 201);
  } catch (error) {
    if (error.message === 'Ya existe un cliente con este RUT') {
      return errorResponse(res, error.message, 400);
    }
    errorResponse(res, error.message, 500);
  }
};

export const updateClienteController = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteActualizado = await updateCliente(id, req.body);

    successResponse(
      res,
      clienteActualizado,
      'Cliente actualizado exitosamente',
    );
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    if (error.message === 'Ya existe un cliente con este RUT') {
      return errorResponse(res, error.message, 400);
    }
    errorResponse(res, error.message, 500);
  }
};

export const deleteClienteController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCliente(id);

    successResponse(res, null, 'Cliente eliminado exitosamente');
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const getClientesActivosController = async (req, res) => {
  try {
    const clientes = await getClientesActivos();
    successResponse(res, clientes, 'Clientes activos obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const searchClientesController = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return errorResponse(res, 'Parámetro de búsqueda requerido', 400);
    }

    const clientes = await searchClientes(q);
    successResponse(res, clientes, 'Búsqueda completada exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Funciones PATCH para compatibilidad
export const patchClienteController = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteActualizado = await updateCliente(id, req.body);

    successResponse(
      res,
      clienteActualizado,
      'Cliente actualizado exitosamente',
    );
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    if (error.message === 'Ya existe un cliente con este RUT') {
      return errorResponse(res, error.message, 400);
    }
    errorResponse(res, error.message, 500);
  }
};

// Función para obtener ubicación de cliente
export const getClienteUbicacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await getClienteById(id);

    const ubicacion = {
      id: cliente.id,
      nombre: cliente.nombre,
      x: cliente.x,
      y: cliente.y,
      direccion: cliente.direccion,
    };

    successResponse(res, ubicacion, 'Ubicación obtenida exitosamente');
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};
