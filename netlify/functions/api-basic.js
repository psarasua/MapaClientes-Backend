// netlify/functions/api-basic.js
import express from "express";
import cors from "cors";
import serverless from "serverless-http";

const app = express();

// Middlewares básicos
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Ruta básica de prueba
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint de salud básico
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Sistema saludable",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint de ping básico
app.get("/api/ping", (req, res) => {
  res.json({
    success: true,
    message: "Pong",
    timestamp: new Date().toISOString(),
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
  });
});

export default serverless(app);
