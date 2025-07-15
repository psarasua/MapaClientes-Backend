import { BaseController } from './baseController.js';
import * as camionesModel from '../models/camionesModel.js';
import { schemas, validateRequest, validateQuery, validateParams } from '../utils/validation.js';

// Crear controlador base
const baseController = new BaseController(camionesModel, 'Camión');

// Exportar métodos CRUD estándar con validación
export const getAllCamiones = [
  validateQuery(schemas.pagination),
  baseController.getAll,
];

export const getCamionById = [
  validateParams(schemas.id),
  baseController.getById,
];

export const createCamion = [
  validateRequest(schemas.camion),
  baseController.create,
];

export const updateCamion = [
  validateParams(schemas.id),
  validateRequest(schemas.camion),
  baseController.update,
];

export const deleteCamion = [
  validateParams(schemas.id),
  baseController.delete,
];
