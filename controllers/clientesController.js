import {
  getAllClientes as getAllClientesModel,
  getClienteById as getClienteByIdModel,
  createCliente as createClienteModel,
  updateCliente as updateClienteModel,
  deleteCliente as deleteClienteModel,
  getClienteUbicacion as getClienteUbicacionModel,
} from '../models/clientesModel.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export const getAllClientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const activo = req.query.activo;

    const result = await getAllClientesModel({
      page,
      limit,
      search,
      activo,
    });

    successResponse(res, result, 'Clientes obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await getClienteByIdModel(id);
    successResponse(res, cliente, 'Cliente obtenido exitosamente');
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const createCliente = async (req, res) => {
  try {
    const nuevoCliente = await createClienteModel(req.body);
    successResponse(res, nuevoCliente, 'Cliente creado exitosamente', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteActualizado = await updateClienteModel(id, req.body);
    successResponse(
      res,
      clienteActualizado,
      'Cliente actualizado exitosamente',
    );
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const patchCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteActualizado = await updateClienteModel(id, req.body);
    successResponse(
      res,
      clienteActualizado,
      'Cliente actualizado exitosamente',
    );
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteEliminado = await deleteClienteModel(id);
    successResponse(res, clienteEliminado, 'Cliente eliminado exitosamente');
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const getClienteUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const ubicacion = await getClienteUbicacionModel(id);
    successResponse(
      res,
      ubicacion,
      'Ubicación del cliente obtenida exitosamente',
    );
  } catch (error) {
    if (error.message === 'Cliente no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};
