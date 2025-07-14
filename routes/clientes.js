// routes/clientes.js
import express from 'express';
import pool from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responses.js';
import { validateCliente, validateClienteUpdate } from '../utils/validation.js';

const router = express.Router();

// GET /api/clientes - Obtener todos los clientes con paginación
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const activo = req.query.activo;
    const offset = (page - 1) * limit;

    // Construir query dinámicamente
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (nombre ILIKE $${paramCount} OR razon ILIKE $${paramCount} OR direccion ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (activo !== undefined) {
      paramCount++;
      whereClause += ` AND activo = $${paramCount}`;
      params.push(activo === 'true');
    }

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) FROM clientes ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Obtener registros paginados
    paramCount++;
    const limit_param = paramCount;
    paramCount++;
    const offset_param = paramCount;
    
    const query = `
      SELECT id, codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y
      FROM clientes 
      ${whereClause}
      ORDER BY nombre ASC
      LIMIT $${limit_param} OFFSET $${offset_param}
    `;
    
    params.push(limit, offset);
    const result = await pool.query(query, params);

    paginatedResponse(res, result.rows, page, limit, total, 'Clientes obtenidos exitosamente');
  } catch (error) {
    console.error('❌ Error al obtener clientes:', error);
    errorResponse(res, 'Error al obtener clientes', 500, error.message);
  }
});

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de cliente inválido', 400);
    }

    const query = 'SELECT * FROM clientes WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Cliente obtenido exitosamente');
  } catch (error) {
    console.error('❌ Error al obtener cliente:', error);
    errorResponse(res, 'Error al obtener cliente', 500, error.message);
  }
});

// POST /api/clientes - Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const clienteData = req.body;
    
    // Validar datos
    const validationErrors = validateCliente(clienteData);
    if (validationErrors.length > 0) {
      return errorResponse(res, 'Datos de cliente inválidos', 400, validationErrors);
    }

    const {
      codigo_alternativo,
      nombre,
      razon,
      direccion,
      telefono,
      rut,
      activo = true,
      x,
      y
    } = clienteData;

    const query = `
      INSERT INTO clientes (codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y];
    const result = await pool.query(query, values);

    successResponse(res, result.rows[0], 'Cliente creado exitosamente', 201);
  } catch (error) {
    console.error('❌ Error al crear cliente:', error);
    
    if (error.code === '23505') {
      return errorResponse(res, 'Ya existe un cliente con ese código alternativo', 409);
    }
    
    errorResponse(res, 'Error al crear cliente', 500, error.message);
  }
});

// PUT /api/clientes/:id - Actualizar cliente completo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clienteData = req.body;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de cliente inválido', 400);
    }

    // Validar datos
    const validationErrors = validateCliente(clienteData);
    if (validationErrors.length > 0) {
      return errorResponse(res, 'Datos de cliente inválidos', 400, validationErrors);
    }

    const {
      codigo_alternativo,
      nombre,
      razon,
      direccion,
      telefono,
      rut,
      activo,
      x,
      y
    } = clienteData;

    const query = `
      UPDATE clientes 
      SET codigo_alternativo = $1, nombre = $2, razon = $3, direccion = $4, 
          telefono = $5, rut = $6, activo = $7, x = $8, y = $9
      WHERE id = $10
      RETURNING *
    `;

    const values = [codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Cliente actualizado exitosamente');
  } catch (error) {
    console.error('❌ Error al actualizar cliente:', error);
    errorResponse(res, 'Error al actualizar cliente', 500, error.message);
  }
});

// PATCH /api/clientes/:id - Actualizar cliente parcialmente
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de cliente inválido', 400);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, 'No se proporcionaron datos para actualizar', 400);
    }

    // Validar solo los campos que se van a actualizar
    const validationErrors = validateClienteUpdate(updates);
    if (validationErrors.length > 0) {
      return errorResponse(res, 'Datos de cliente inválidos', 400, validationErrors);
    }

    // Construir query dinámicamente
    const allowedFields = ['codigo_alternativo', 'nombre', 'razon', 'direccion', 'telefono', 'rut', 'activo', 'x', 'y'];
    const setClause = [];
    const values = [];
    let paramCount = 0;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        paramCount++;
        setClause.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
      }
    }

    if (setClause.length === 0) {
      return errorResponse(res, 'No se proporcionaron campos válidos para actualizar', 400);
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE clientes 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Cliente actualizado exitosamente');
  } catch (error) {
    console.error('❌ Error al actualizar cliente:', error);
    errorResponse(res, 'Error al actualizar cliente', 500, error.message);
  }
});

// DELETE /api/clientes/:id - Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de cliente inválido', 400);
    }

    const query = 'DELETE FROM clientes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cliente no encontrado', 404);
    }

    successResponse(res, result.rows[0], 'Cliente eliminado exitosamente');
  } catch (error) {
    console.error('❌ Error al eliminar cliente:', error);
    errorResponse(res, 'Error al eliminar cliente', 500, error.message);
  }
});

// GET /api/clientes/:id/ubicacion - Obtener solo la ubicación de un cliente
router.get('/:id/ubicacion', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return errorResponse(res, 'ID de cliente inválido', 400);
    }

    const query = 'SELECT id, nombre, x, y FROM clientes WHERE id = $1 AND x IS NOT NULL AND y IS NOT NULL';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cliente no encontrado o sin ubicación', 404);
    }

    successResponse(res, result.rows[0], 'Ubicación del cliente obtenida exitosamente');
  } catch (error) {
    console.error('❌ Error al obtener ubicación:', error);
    errorResponse(res, 'Error al obtener ubicación', 500, error.message);
  }
});

export default router;
