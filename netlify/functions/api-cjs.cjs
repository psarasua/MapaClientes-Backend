const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

// Función para importar dinámicamente los módulos ES6
async function createApp() {
  const { default: prisma } = await import("../../lib/prisma.js");

  // Importar rutas modularizadas
  const { default: camionesRoutes } = await import("../../routes/camiones.js");
  const { default: clientesRoutes } = await import("../../routes/clientes.js");
  const { default: diasEntregaRoutes } = await import(
    "../../routes/diasEntrega.js"
  );
  const { default: healthRoutes } = await import("../../routes/health.js");
  const { default: pingRoutes } = await import("../../routes/ping.js");

  // Crear aplicación Express
  const app = express();

  // Middlewares de seguridad y configuración
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
    })
  );

  // Middleware para parsing de JSON
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Middleware personalizado para manejar raw body en Netlify Functions
  app.use(express.raw({ type: "application/json", limit: "10mb" }));
  app.use((req, res, next) => {
    if (req.body && Buffer.isBuffer(req.body)) {
      try {
        const jsonString = req.body.toString("utf8");
        req.body = JSON.parse(jsonString);
      } catch (error) {
        console.error("❌ Error parseando raw body:", error);
      }
    }
    next();
  });

  // Middleware de logging simple
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Ruta principal con información de la API
  app.get("/api", async (req, res) => {
    try {
      // Verificar estado de la base de datos
      let dbStatus = "🔴 Desconectada";
      let dbResponseTime = 0;

      try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbResponseTime = Date.now() - dbStart;
        dbStatus = "🟢 Conectada";
      } catch (error) {
        dbStatus = "🔴 Error de conexión";
        console.error("Error de DB:", error.message);
      }

      const response = {
        success: true,
        message: "API MapaClientes Backend",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
        },
        endpoints: {
          camiones: "/api/camiones",
          clientes: "/api/clientes",
          diasEntrega: "/api/dias-entrega",
          health: "/api/health",
          ping: "/api/ping",
        },
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Error en ruta API:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Ruta raíz
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Bienvenido a MapaClientes Backend API",
      version: "2.0.0",
      documentation: "/api",
      timestamp: new Date().toISOString(),
    });
  });

  // Usar las rutas modularizadas
  app.use("/api/camiones", camionesRoutes);
  app.use("/api/clientes", clientesRoutes);
  app.use("/api/dias-entrega", diasEntregaRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/ping", pingRoutes);

  // Middleware de manejo de rutas no encontradas
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Ruta no encontrada",
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  });

  // Middleware de manejo de errores
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

  return app;
}

// Exportar para Netlify Functions
let appInstance = null;

module.exports.handler = async (event, context) => {
  if (!appInstance) {
    appInstance = await createApp();
  }

  const handler = serverless(appInstance);
  return handler(event, context);
};
