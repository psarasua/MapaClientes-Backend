import {
  getAllCamiones,
  getCamionById,
  createCamion,
  updateCamion,
  deleteCamion,
  getCamionesConDias,
  asignarDiasACamion,
  getDiasCamion,
} from '../models/camionesModel.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export const getAllCamionesController = async (req, res) => {
  try {
    const camiones = await getAllCamiones();
    successResponse(res, camiones, 'Camiones obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getCamionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const camion = await getCamionById(id);

    successResponse(res, camion, 'Camión obtenido exitosamente');
  } catch (error) {
    if (error.message === 'Camión no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const createCamionController = async (req, res) => {
  try {
    const nuevoCamion = await createCamion(req.body);
    successResponse(res, nuevoCamion, 'Camión creado exitosamente', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const updateCamionController = async (req, res) => {
  try {
    const { id } = req.params;
    const camionActualizado = await updateCamion(id, req.body);

    successResponse(res, camionActualizado, 'Camión actualizado exitosamente');
  } catch (error) {
    if (error.message === 'Camión no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const deleteCamionController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCamion(id);

    successResponse(res, null, 'Camión eliminado exitosamente');
  } catch (error) {
    if (error.message === 'Camión no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const getCamionesConDiasController = async (req, res) => {
  try {
    const camiones = await getCamionesConDias();
    successResponse(res, camiones, 'Camiones con días obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const asignarDiasACamionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { diasIds } = req.body;

    if (!diasIds || !Array.isArray(diasIds)) {
      return errorResponse(res, 'Se requiere un array de IDs de días', 400);
    }

    await asignarDiasACamion(id, diasIds);
    successResponse(res, null, 'Días asignados al camión exitosamente');
  } catch (error) {
    if (error.message === 'Camión no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const getDiasCamionController = async (req, res) => {
  try {
    const { id } = req.params;
    const dias = await getDiasCamion(id);

    successResponse(res, dias, 'Días del camión obtenidos exitosamente');
  } catch (error) {
    if (error.message === 'Camión no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};
