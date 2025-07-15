import { getAllClientesModel, getClienteByIdModel, createClienteModel, updateClienteModel, patchClienteModel, deleteClienteModel, getClienteUbicacionModel } from '../models/clientesModel.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export const getAllClientes = async (req, res) => {
  try {
    const clientes = await getAllClientesModel();
    successResponse(res, clientes, 'Clientes obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await getClienteByIdModel(id);
    
    if (!cliente) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }
    
    successResponse(res, cliente, 'Cliente obtenido exitosamente');
  } catch (error) {
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
    
    if (!clienteActualizado) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }
    
    successResponse(res, clienteActualizado, 'Cliente actualizado exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const patchCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteActualizado = await patchClienteModel(id, req.body);
    
    if (!clienteActualizado) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }
    
    successResponse(res, clienteActualizado, 'Cliente actualizado exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteEliminado = await deleteClienteModel(id);
    
    if (!clienteEliminado) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }
    
    successResponse(res, null, 'Cliente eliminado exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getClienteUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const ubicacion = await getClienteUbicacionModel(id);
    
    if (!ubicacion) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }
    
    successResponse(res, ubicacion, 'Ubicación del cliente obtenida exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
