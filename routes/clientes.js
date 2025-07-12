// routes/clientes.js
import express from 'express';

const router = express.Router();

// GET /api/clientes - Obtener todos los clientes
router.get('/', (req, res) => {
  res.json({
    message: "Endpoint de clientes funcionando",
    data: [],
    status: "ok",
    timestamp: new Date().toISOString()
  });
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
