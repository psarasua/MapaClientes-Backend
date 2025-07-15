// models/camionesModel.js
import pool from '../config/database.js';

export class CamionModel {
  // Obtener todos los camiones con paginación y filtros
  static async getAll({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;
    
    // Construir query dinámicamente
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND descripcion ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) FROM camiones ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Obtener registros paginados
    paramCount++;
    const limit_param = paramCount;
    paramCount++;
    const offset_param = paramCount;
    
    const query = `
      SELECT id, descripcion
      FROM camiones 
      ${whereClause}
      ORDER BY descripcion ASC
      LIMIT $${limit_param} OFFSET $${offset_param}
    `;
    
    params.push(limit, offset);
    const result = await pool.query(query, params);

    return {
      data: result.rows,
      total,
    };
  }

  // Obtener camión por ID
  static async getById(id) {
    const query = 'SELECT * FROM camiones WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  // Crear nuevo camión
  static async create(camionData) {
    const { descripcion } = camionData;

    const query = `
      INSERT INTO camiones (descripcion)
      VALUES ($1)
      RETURNING *
    `;

    const result = await pool.query(query, [descripcion]);
    return result.rows[0];
  }

  // Actualizar camión
  static async update(id, camionData) {
    const { descripcion } = camionData;

    const query = `
      UPDATE camiones 
      SET descripcion = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [descripcion, id]);
    return result.rows[0] || null;
  }

  // Eliminar camión
  static async delete(id) {
    const query = 'DELETE FROM camiones WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Verificar si el camión está siendo usado
  static async isUsed(id) {
    const checkUsageQuery = `
      SELECT COUNT(*) as count 
      FROM camiones_dias 
      WHERE camion_id = $1
    `;

    const usageResult = await pool.query(checkUsageQuery, [id]);
    return usageResult.rows[0].count > 0;
  }

  // Obtener camiones con sus días asignados
  static async getWithDays() {
    const query = `
      SELECT 
        c.id,
        c.descripcion,
        c.created_at,
        c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', d.id,
              'descripcion', d.descripcion
            )
          ) FILTER (WHERE d.id IS NOT NULL),
          '[]'
        ) as dias_asignados
      FROM camiones c
      LEFT JOIN camiones_dias cd ON c.id = cd.camion_id
      LEFT JOIN dias_entrega d ON cd.dia_entrega_id = d.id
      GROUP BY c.id, c.descripcion, c.created_at, c.updated_at
      ORDER BY c.descripcion ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}

// Exportar funciones individuales para los controladores
export const getAllCamionesModel = (filters = {}) => CamionModel.getAll(filters);
export const getCamionByIdModel = (id) => CamionModel.getById(id);
export const createCamionModel = (camionData) => CamionModel.create(camionData);
export const updateCamionModel = (id, camionData) => CamionModel.update(id, camionData);
export const deleteCamionModel = (id) => CamionModel.delete(id);
export const isUsedCamionModel = (id) => CamionModel.isUsed(id);
