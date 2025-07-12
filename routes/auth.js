import express from 'express';
import { requireDatabase } from '../middlewares/checkDatabase.js';

const router = express.Router();

// Rutas de auth que requieren BD
router.post('/login', requireDatabase, (req, res) => {
  res.json({
    message: "Endpoint de login funcionando",
    note: "Base de datos configurada pero sin autenticación real todavía",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

router.post('/signup', requireDatabase, (req, res) => {
  res.json({
    message: "Endpoint de signup funcionando", 
    note: "Base de datos configurada pero sin registro real todavía",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export default router;
