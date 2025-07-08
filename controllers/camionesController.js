// controllers/camionesController.js
// Controlador para operaciones relacionadas con camiones. Gestiona la lógica de negocio de camiones.
import pool from '../config/db.js';

// Obtiene la lista de camiones de la base de datos
export const getCamiones = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM camiones');
    res.json(result.rows);
  } catch (err) {
    err.status = 500;
    err.message = 'Error al obtener camiones';
    next(err);
  }
};
