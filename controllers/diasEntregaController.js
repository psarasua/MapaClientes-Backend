import { getAllDiasEntregaModel, getDiaEntregaByIdModel, createDiaEntregaModel, updateDiaEntregaModel, deleteDiaEntregaModel } from '../models/diasEntregaModel.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export const getAllDiasEntrega = async (req, res) => {
  try {
    const diasEntrega = await getAllDiasEntregaModel();
    successResponse(res, diasEntrega, 'Días de entrega obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getDiaEntregaById = async (req, res) => {
  try {
    const { id } = req.params;
    const diaEntrega = await getDiaEntregaByIdModel(id);
    
    if (!diaEntrega) {
      return errorResponse(res, 'Día de entrega no encontrado', 404);
    }
    
    successResponse(res, diaEntrega, 'Día de entrega obtenido exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const createDiaEntrega = async (req, res) => {
  try {
    const nuevoDiaEntrega = await createDiaEntregaModel(req.body);
    successResponse(res, nuevoDiaEntrega, 'Día de entrega creado exitosamente', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const updateDiaEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const diaEntregaActualizado = await updateDiaEntregaModel(id, req.body);
    
    if (!diaEntregaActualizado) {
      return errorResponse(res, 'Día de entrega no encontrado', 404);
    }
    
    successResponse(res, diaEntregaActualizado, 'Día de entrega actualizado exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const deleteDiaEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const diaEntregaEliminado = await deleteDiaEntregaModel(id);
    
    if (!diaEntregaEliminado) {
      return errorResponse(res, 'Día de entrega no encontrado', 404);
    }
    
    successResponse(res, null, 'Día de entrega eliminado exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};
