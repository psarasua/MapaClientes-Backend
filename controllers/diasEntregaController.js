import {
  getAllDiasEntrega,
  getDiaEntregaById,
  createDiaEntrega,
  updateDiaEntrega,
  deleteDiaEntrega,
  getDiasEntregaConCamiones,
  getDiasEntregaDisponibles,
  getCamionesDia,
  asignarCamionesADia,
} from '../models/diasEntregaModel.js';
import { successResponse, errorResponse } from '../utils/responses.js';

export const getAllDiasEntregaController = async (req, res) => {
  try {
    const diasEntrega = await getAllDiasEntrega();
    successResponse(res, diasEntrega, 'Días de entrega obtenidos exitosamente');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getDiaEntregaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const diaEntrega = await getDiaEntregaById(id);

    successResponse(res, diaEntrega, 'Día de entrega obtenido exitosamente');
  } catch (error) {
    if (error.message === 'Día de entrega no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const createDiaEntregaController = async (req, res) => {
  try {
    const nuevoDiaEntrega = await createDiaEntrega(req.body);
    successResponse(
      res,
      nuevoDiaEntrega,
      'Día de entrega creado exitosamente',
      201,
    );
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const updateDiaEntregaController = async (req, res) => {
  try {
    const { id } = req.params;
    const diaEntregaActualizado = await updateDiaEntrega(id, req.body);

    successResponse(
      res,
      diaEntregaActualizado,
      'Día de entrega actualizado exitosamente',
    );
  } catch (error) {
    if (error.message === 'Día de entrega no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const deleteDiaEntregaController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDiaEntrega(id);

    successResponse(res, null, 'Día de entrega eliminado exitosamente');
  } catch (error) {
    if (error.message === 'Día de entrega no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const getDiasEntregaConCamionesController = async (req, res) => {
  try {
    const diasEntrega = await getDiasEntregaConCamiones();
    successResponse(
      res,
      diasEntrega,
      'Días de entrega con camiones obtenidos exitosamente',
    );
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getDiasEntregaDisponiblesController = async (req, res) => {
  try {
    const diasEntrega = await getDiasEntregaDisponibles();
    successResponse(
      res,
      diasEntrega,
      'Días de entrega disponibles obtenidos exitosamente',
    );
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export const getCamionesDiaController = async (req, res) => {
  try {
    const { id } = req.params;
    const camiones = await getCamionesDia(id);

    successResponse(res, camiones, 'Camiones del día obtenidos exitosamente');
  } catch (error) {
    if (error.message === 'Día de entrega no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};

export const asignarCamionesADiaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { camionesIds } = req.body;

    if (!camionesIds || !Array.isArray(camionesIds)) {
      return errorResponse(res, 'Se requiere un array de IDs de camiones', 400);
    }

    await asignarCamionesADia(id, camionesIds);
    successResponse(res, null, 'Camiones asignados al día exitosamente');
  } catch (error) {
    if (error.message === 'Día de entrega no encontrado') {
      return errorResponse(res, error.message, 404);
    }
    errorResponse(res, error.message, 500);
  }
};
