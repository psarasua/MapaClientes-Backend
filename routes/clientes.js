// routes/clientes.js
import express from 'express';
import pool from '../netlify/functions/db.js';

const router = express.Router();

// GET /api/clientes - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    // Ejemplo de consulta, modificar según la estructura real
    const result = await pool.query('SELECT * FROM clientes LIMIT 10');
    res.json({
      message: "Clientes obtenidos desde la base de datos",
      data: result.rows,
      status: "ok",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener clientes",
      error: error.message,
      status: "error",
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/clientes - Crear nuevo cliente
router.post('/', (req, res) => {
  res.json({
    message: "Cliente creado (simulado)",
    data: { id: 1, ...req.body },
    status: "created",
    timestamp: new Date().toISOString()
  });
});

export default router;
