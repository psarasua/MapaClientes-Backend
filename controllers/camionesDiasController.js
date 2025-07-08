// controllers/camionesDiasController.js
// Controlador para operaciones relacionadas con la asignación de camiones a días. Gestiona la lógica de negocio de asignaciones.
import pool from '../config/db.js';

export const getCamionesDias = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM camiones_dias');
    res.json(result.rows);
  } catch (err) {
    err.status = 500;
    err.message = 'Error al obtener camiones_dias';
    next(err);
  }
};

export const getClientesAsignados = async (req, res, next) => {
  try {
    const { camion_dia } = req.params;
    const result = await pool.query('SELECT * FROM camion_dias_entrega WHERE camion_dia = $1', [camion_dia]);
    res.json(result.rows);
  } catch (err) {
    err.status = 500;
    err.message = 'Error al obtener clientes asignados';
    next(err);
  }
};
