import express from 'express';

const router = express.Router();

// Rutas simples de prueba para auth
router.post('/login', (req, res) => {
  res.json({
    message: "Endpoint de login funcionando",
    note: "Base de datos no configurada - esto es una respuesta de prueba",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

router.post('/signup', (req, res) => {
  res.json({
    message: "Endpoint de signup funcionando", 
    note: "Base de datos no configurada - esto es una respuesta de prueba",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
