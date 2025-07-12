// routes/ping.js
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: 'Netlify Functions',
    message: 'Pong!'
  });
});

export default router;
