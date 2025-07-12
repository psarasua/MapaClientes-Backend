// test-server.js
// Servidor de prueba para verificar que la configuración funciona
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// Página de inicio simple
app.get('/', (req, res) => {
  res.send(`
    <h1>🗺️ MapaClientes Backend API</h1>
    <p>✅ Servidor funcionando correctamente</p>
    <p><a href="/api/ping">🏓 Test API</a></p>
    <p><a href="/api/docs">📚 Documentación</a></p>
  `);
});

// Test endpoint
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api/docs`);
});
