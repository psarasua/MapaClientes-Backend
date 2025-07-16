import {
  getAllDiasEntrega as getAllDiasEntregaModel,
  getDiaEntregaById as getDiaEntregaByIdModel,
  createDiaEntrega as createDiaEntregaModel,
  updateDiaEntrega as updateDiaEntregaModel,
  deleteDiaEntrega as deleteDiaEntregaModel,
} from '../models/diasEntregaModel.js';
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
    successResponse(res, diaEntrega, 'Día de entrega obtenido exitosamente');
  } catch (error) {
    if (error.message === 'Día de entrega no encontrado') {
      return errorResponse(res, error.message, 404);
    }
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
    successResponse(res, diaEntregaActualizado, 'Día de entrega actualizado exitosamente');
  } catch (error) {
    if (error.message === 'Día de entrega no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const deleteDiaEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const diaEntregaEliminado = await deleteDiaEntregaModel(id);
    successResponse(res, diaEntregaEliminado, 'Día de entrega eliminado exitosamente');
  } catch (error) {
    if (error.message === 'Día de entrega no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};
