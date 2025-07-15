// controllers/camionesController.js
import {
  getAllCamionesModel,
  getCamionByIdModel,
  createCamionModel,
  updateCamionModel,
  deleteCamionModel,
  isUsedCamionModel,
} from "../models/camionesModel.js";
import { successResponse, errorResponse } from "../utils/responses.js";

// Obtener todos los camiones con paginación
export const getAllCamiones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const result = await getAllCamionesModel({ page, limit, search });

    // Usar la función de respuesta estándar
    successResponse(res, result.data, "Camiones obtenidos exitosamente");
  } catch (error) {
    console.error("❌ Error al obtener camiones:", error);
    errorResponse(res, "Error interno del servidor", 500);
  }
};

// Obtener camión por ID
export const getCamionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return errorResponse(res, "ID inválido", 400);
    }

    const camion = await getCamionByIdModel(id);

    if (!camion) {
      return errorResponse(res, "Camión no encontrado", 404);
    }

    successResponse(res, camion, "Camión obtenido exitosamente");
  } catch (error) {
    console.error("❌ Error al obtener camión:", error);
    errorResponse(res, "Error interno del servidor", 500);
  }
};

// Crear nuevo camión
export const createCamion = async (req, res) => {
  try {
    const camionData = req.body;

    // Validar datos
    const validationErrors = validateCamion(camionData);
    if (validationErrors.length > 0) {
      return errorResponse(res, "Datos inválidos", 400, validationErrors);
    }

    const camion = await createCamionModel(camionData);

    successResponse(res, camion, "Camión creado exitosamente", 201);
  } catch (error) {
    console.error("❌ Error al crear camión:", error);

    // Error de clave única (PostgreSQL)
    if (error.code === "23505") {
      return errorResponse(res, "Ya existe un camión con esa descripción", 409);
    }

    errorResponse(res, "Error interno del servidor", 500);
  }
};

// Actualizar camión completo
export const updateCamion = async (req, res) => {
  try {
    const { id } = req.params;
    const camionData = req.body;

    // Log para debugging - información más detallada
    console.log("🔍 Actualizando camión:");
    console.log("- ID:", id);
    console.log("- req.body:", req.body);
    console.log("- req.body type:", typeof req.body);
    console.log("- req.body JSON:", JSON.stringify(req.body));
    console.log("- camionData:", camionData);

    if (!id || isNaN(id)) {
      console.log("❌ ID inválido:", id);
      return errorResponse(res, "ID inválido", 400);
    }

    // Validar datos
    const validationErrors = validateCamion(camionData);
    if (validationErrors.length > 0) {
      console.log("❌ Errores de validación:", validationErrors);
      return errorResponse(res, "Datos inválidos", 400, validationErrors);
    }

    const camion = await updateCamionModel(id, camionData);

    if (!camion) {
      return errorResponse(res, "Camión no encontrado", 404);
    }

    successResponse(res, camion, "Camión actualizado exitosamente");
  } catch (error) {
    console.error("❌ Error al actualizar camión:", error);

    if (error.code === "23505") {
      return errorResponse(res, "Ya existe un camión con esa descripción", 409);
    }

    errorResponse(res, "Error interno del servidor", 500);
  }
};

// Eliminar camión
export const deleteCamion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return errorResponse(res, "ID inválido", 400);
    }

    // Verificar si el camión está siendo usado
    const isUsed = await isUsedCamionModel(id);
    if (isUsed) {
      return errorResponse(
        res,
        "No se puede eliminar el camión porque está siendo usado",
        400
      );
    }

    const camion = await deleteCamionModel(id);

    if (!camion) {
      return errorResponse(res, "Camión no encontrado", 404);
    }

    successResponse(res, camion, "Camión eliminado exitosamente");
  } catch (error) {
    console.error("❌ Error al eliminar camión:", error);

    if (error.code === "23503") {
      return errorResponse(
        res,
        "No se puede eliminar el camión porque está siendo usado",
        400
      );
    }

    errorResponse(res, "Error interno del servidor", 500);
  }
};

// Función de validación para camiones
export const validateCamion = (camionData) => {
  const errors = [];

  console.log("🔍 Validando datos del camión:", camionData);

  if (!camionData || typeof camionData !== "object") {
    errors.push("Los datos del camión son requeridos");
    console.log("❌ Datos del camión no válidos:", typeof camionData);
    return errors;
  }

  if (
    !camionData.descripcion ||
    typeof camionData.descripcion !== "string" ||
    camionData.descripcion.trim() === ""
  ) {
    errors.push("La descripción es requerida y debe ser un texto válido");
    console.log("❌ Descripción inválida:", {
      descripcion: camionData.descripcion,
      tipo: typeof camionData.descripcion,
    });
  }

  if (camionData.descripcion && camionData.descripcion.length > 255) {
    errors.push("La descripción no puede exceder 255 caracteres");
    console.log("❌ Descripción muy larga:", camionData.descripcion.length);
  }

  console.log("✅ Resultado de validación:", { errors });
  return errors;
};

// Función de prueba para debugging
export const testCamion = async (req, res) => {
  console.log("🧪 TEST ENDPOINT - Información completa:");
  console.log("- req.method:", req.method);
  console.log("- req.params:", req.params);
  console.log("- req.body:", req.body);
  console.log("- req.body type:", typeof req.body);
  console.log("- req.headers:", req.headers);
  console.log("- req.headers[content-type]:", req.headers["content-type"]);

  // Intentar parsear manualmente si es string
  let parsedBody = req.body;
  if (typeof req.body === "string") {
    try {
      parsedBody = JSON.parse(req.body);
      console.log("✅ Parsed body:", parsedBody);
    } catch (error) {
      console.log("❌ Error parsing body:", error);
    }
  }

  // Validar con la función original
  const validationErrors = validateCamion(req.body);
  console.log("📋 Validation errors:", validationErrors);

  successResponse(
    res,
    {
      method: req.method,
      params: req.params,
      body: req.body,
      bodyType: typeof req.body,
      parsedBody: parsedBody,
      validationErrors: validationErrors,
      headers: req.headers,
    },
    "Test endpoint ejecutado correctamente"
  );
};
