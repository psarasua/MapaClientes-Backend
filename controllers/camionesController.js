import {
  getAllCamiones as getAllCamionesModel,
  getCamionById as getCamionByIdModel,
  createCamion as createCamionModel,
  updateCamion as updateCamionModel,
  deleteCamion as deleteCamionModel,
} from '../models/camionesModel.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export const getAllCamiones = async (req, res) => {
  try {
    const camiones = await getAllCamionesModel();
    successResponse(res, camiones, 'Camiones obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getCamionById = async (req, res) => {
  try {
    const { id } = req.params;
    const camion = await getCamionByIdModel(id);
    successResponse(res, camion, 'Camión obtenido exitosamente');
  } catch (error) {
    if (error.message === 'Camión no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const createCamion = async (req, res) => {
  try {
    const nuevoCamion = await createCamionModel(req.body);
    successResponse(res, nuevoCamion, 'Camión creado exitosamente', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const updateCamion = async (req, res) => {
  try {
    const { id } = req.params;
    const camionActualizado = await updateCamionModel(id, req.body);
    successResponse(res, camionActualizado, 'Camión actualizado exitosamente');
  } catch (error) {
    if (error.message === 'Camión no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const deleteCamion = async (req, res) => {
  try {
    const { id } = req.params;
    const camionEliminado = await deleteCamionModel(id);
    successResponse(res, camionEliminado, 'Camión eliminado exitosamente');
  } catch (error) {
    if (error.message === 'Camión no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};
