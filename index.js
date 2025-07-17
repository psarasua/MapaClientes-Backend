// index.js
console.log("🚀 Iniciando servidor...");
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

console.log("📦 Imports cargados correctamente");

// Configurar variables de entorno
dotenv.config();
console.log("🔧 Variables de entorno configuradas");

// Importar rutas
import camionesRoutes from "./routes/camiones.js";
import clientesRoutes from "./routes/clientes.js";
import diasEntregaRoutes from "./routes/diasEntrega.js";
import usuariosRoutes from "./routes/usuarios.js";
import healthRoutes from "./routes/health.js";
import pingRoutes from "./routes/ping.js";

console.log("🛣️ Rutas importadas correctamente");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("⚙️ Configurando middlewares...");

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

console.log("🌐 Configurando rutas...");

// Rutas principales
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenido a MapaClientes Backend API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      camiones: "/api/camiones",
      clientes: "/api/clientes",
      diasEntrega: "/api/dias-entrega",
      usuarios: "/api/usuarios",
      health: "/api/health",
      ping: "/api/ping",
    },
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API MapaClientes Backend",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      camiones: "/api/camiones",
      clientes: "/api/clientes",
      diasEntrega: "/api/dias-entrega",
      usuarios: "/api/usuarios",
      health: "/api/health",
      ping: "/api/ping",
    },
  });
});

// Usar las rutas
app.use("/api/camiones", camionesRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/dias-entrega", diasEntregaRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/ping", pingRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores
app.use((err, req, res, _next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "production" ? "Algo salió mal" : err.message,
    timestamp: new Date().toISOString(),
  });
});

console.log("🎯 Iniciando servidor en puerto", PORT);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check en: http://localhost:${PORT}/api/health`);

  // Keep-alive para evitar suspensión
  if (process.env.NODE_ENV === "production") {
    setInterval(() => {
      console.log("⏰ Keep-alive ping:", new Date().toISOString());
    }, 30000); // Cada 30 segundos
  }
});

export default app;
