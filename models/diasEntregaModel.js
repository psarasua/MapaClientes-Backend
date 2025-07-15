// models/diasEntregaModel.js
import pool from '../config/database.js';

export class DiaEntregaModel {
  // Obtener todos los días de entrega con paginación y filtros
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
    const countQuery = `SELECT COUNT(*) FROM dias_entrega ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Obtener registros paginados
    paramCount++;
    const limit_param = paramCount;
    paramCount++;
    const offset_param = paramCount;
    
    const query = `
      SELECT id, descripcion
      FROM dias_entrega 
      ${whereClause}
      ORDER BY id ASC
      LIMIT $${limit_param} OFFSET $${offset_param}
    `;
    
    params.push(limit, offset);
    const result = await pool.query(query, params);

    return {
      data: result.rows,
      total,
    };
  }

  // Obtener día de entrega por ID
  static async getById(id) {
    const query = 'SELECT * FROM dias_entrega WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  // Crear nuevo día de entrega
  static async create(diaData) {
    const { descripcion } = diaData;

    const query = `
      INSERT INTO dias_entrega (descripcion)
      VALUES ($1)
      RETURNING *
    `;

    const result = await pool.query(query, [descripcion]);
    return result.rows[0];
  }

  // Actualizar día de entrega
  static async update(id, diaData) {
    const { descripcion } = diaData;

    const query = `
      UPDATE dias_entrega 
      SET descripcion = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [descripcion, id]);
    return result.rows[0] || null;
  }

  // Eliminar día de entrega
  static async delete(id) {
    const query = 'DELETE FROM dias_entrega WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Verificar si el día de entrega está siendo usado
  static async isUsed(id) {
    const checkUsageQuery = `
      SELECT COUNT(*) as count 
      FROM camiones_dias 
      WHERE dia_entrega_id = $1
    `;

    const usageResult = await pool.query(checkUsageQuery, [id]);
    return usageResult.rows[0].count > 0;
  }

  // Obtener días de entrega con sus camiones asignados
  static async getWithCamiones() {
    const query = `
      SELECT 
        d.id,
        d.descripcion,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'descripcion', c.descripcion
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as camiones_asignados
      FROM dias_entrega d
      LEFT JOIN camiones_dias cd ON d.id = cd.dia_entrega_id
      LEFT JOIN camiones c ON cd.camion_id = c.id
      GROUP BY d.id, d.descripcion
      ORDER BY d.id ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }
}
