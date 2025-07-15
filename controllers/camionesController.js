// controllers/camionesController.js
import { CamionModel } from '../models/camionesModel.js';

// Obtener todos los camiones con paginación
export const getAllCamiones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const result = await CamionModel.getAll({ page, limit, search });
    
    // Devolver solo los datos sin wrapper
    res.json(result.data);
  } catch (error) {
    console.error('❌ Error al obtener camiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener camión por ID
export const getCamionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const camion = await CamionModel.getById(id);

    if (!camion) {
      return res.status(404).json({ error: 'Camión no encontrado' });
    }

    res.json(camion);
  } catch (error) {
    console.error('❌ Error al obtener camión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nuevo camión
export const createCamion = async (req, res) => {
  try {
    const camionData = req.body;
    
    // Validar datos
    const validationErrors = validateCamion(camionData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details: validationErrors });
    }

    const camion = await CamionModel.create(camionData);

    res.status(201).json(camion);
  } catch (error) {
    console.error('❌ Error al crear camión:', error);
    
    // Error de clave única (PostgreSQL)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un camión con esa descripción' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar camión completo
export const updateCamion = async (req, res) => {
  try {
    const { id } = req.params;
    const camionData = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Validar datos
    const validationErrors = validateCamion(camionData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details: validationErrors });
    }

    const camion = await CamionModel.update(id, camionData);

    if (!camion) {
      return res.status(404).json({ error: 'Camión no encontrado' });
    }

    res.json(camion);
  } catch (error) {
    console.error('❌ Error al actualizar camión:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un camión con esa descripción' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar camión
export const deleteCamion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar si el camión está siendo usado
    const isUsed = await CamionModel.isUsed(id);
    if (isUsed) {
      return res.status(400).json({ error: 'No se puede eliminar el camión porque está siendo usado' });
    }

    const camion = await CamionModel.delete(id);

    if (!camion) {
      return res.status(404).json({ error: 'Camión no encontrado' });
    }

    res.json(camion);
  } catch (error) {
    console.error('❌ Error al eliminar camión:', error);
    
    if (error.code === '23503') {
      return res.status(400).json({ error: 'No se puede eliminar el camión porque está siendo usado' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función de validación para camiones
export const validateCamion = (camionData) => {
  const errors = [];

  if (!camionData || typeof camionData !== 'object') {
    errors.push('Los datos del camión son requeridos');
    return errors;
  }

  if (!camionData.descripcion || typeof camionData.descripcion !== 'string' || camionData.descripcion.trim() === '') {
    errors.push('La descripción es requerida y debe ser un texto válido');
  }

  if (camionData.descripcion && camionData.descripcion.length > 255) {
    errors.push('La descripción no puede exceder 255 caracteres');
  }

  return errors;
};
