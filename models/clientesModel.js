// models/clientesModel.js
import pool from '../config/database.js';

// Obtener todos los clientes con paginación y filtros
export async function getAllClientes({ page = 1, limit = 10, search = '', activo = undefined }) {
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

  return {
    data: result.rows,
    total,
  };
}

// Obtener cliente por ID
export async function getClienteById(id) {
  const query = 'SELECT * FROM clientes WHERE id = $1';
  const result = await pool.query(query, [id]);
  
  return result.rows[0] || null;
}

// Crear nuevo cliente
export async function createCliente(clienteData) {
  const {
    codigo_alternativo,
    nombre,
    razon,
    direccion,
    telefono,
    rut,
    activo = true,
    x,
    y,
  } = clienteData;

  const query = `
    INSERT INTO clientes (codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [codigo_alternativo, nombre, razon, direccion, telefono, rut, activo, x, y];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Actualizar cliente completo
export async function updateCliente(id, clienteData) {
  const {
    codigo_alternativo,
    nombre,
    razon,
    direccion,
    telefono,
    rut,
    activo,
    x,
    y,
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
  return result.rows[0] || null;
}

// Actualizar cliente parcialmente
export async function patchCliente(id, updates) {
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
    return null;
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
  return result.rows[0] || null;
}

// Eliminar cliente
export async function deleteCliente(id) {
  const query = 'DELETE FROM clientes WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

// Obtener solo la ubicación de un cliente
export async function getClienteUbicacion(id) {
  const query = 'SELECT id, nombre, x, y FROM clientes WHERE id = $1 AND x IS NOT NULL AND y IS NOT NULL';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

// Obtener clientes activos
export async function getClientesActivos() {
  const query = 'SELECT * FROM clientes WHERE activo = true ORDER BY nombre ASC';
  const result = await pool.query(query);
  return result.rows;
}

// Obtener clientes con ubicación
export async function getClientesConUbicacion() {
  const query = 'SELECT * FROM clientes WHERE x IS NOT NULL AND y IS NOT NULL ORDER BY nombre ASC';
  const result = await pool.query(query);
  return result.rows;
}

// Exportar funciones individuales para los controladores (compatibilidad hacia atrás)
export const getAllClientesModel = (filters = {}) => getAllClientes(filters);
export const getClienteByIdModel = (id) => getClienteById(id);
export const createClienteModel = (clienteData) => createCliente(clienteData);
export const updateClienteModel = (id, clienteData) => updateCliente(id, clienteData);
export const patchClienteModel = (id, updates) => patchCliente(id, updates);
export const deleteClienteModel = (id) => deleteCliente(id);
export const getClienteUbicacionModel = (id) => getClienteUbicacion(id);
