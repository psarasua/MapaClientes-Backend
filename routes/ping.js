// routes/ping.js
// Endpoint simple para chequeo de salud del backend (ping).
import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  if (req.query.db) {
    try {
      // Chequeo simple a la base de datos
      const pool = req.app.get('pool');
      if (pool) {
        await pool.query('SELECT 1');
        return res.status(200).json({ status: 'ok', db: true });
      }
      return res.status(500).json({ status: 'ok', db: false, error: 'No pool' });
    } catch (err) {
      return res.status(500).json({ status: 'ok', db: false, error: err.message });
    }
  }
  res.status(200).json({ status: 'ok' });
});

export default router;
