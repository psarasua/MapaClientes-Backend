# MapaClientes Backend

API simple para gestión de clientes desplegada en Netlify Functions.

## 🚀 Estructura del Proyecto

```
MapaClientes-Backend/
├── netlify/
│   └── functions/
│       └── api.js          # Función principal de Netlify
├── routes/
│   ├── clientes.js         # Rutas para clientes
│   └── ping.js            # Endpoint de health check
├── schema/                 # Esquemas SQL para futura BD
├── netlify.toml           # Configuración de Netlify
├── _redirects             # Redirecciones
└── package.json           # Dependencias del proyecto
```

## 📦 Instalación

```bash
npm install
```

## 🧪 Desarrollo Local

```bash
npm run dev
```

La API estará disponible en: `http://localhost:8888/api`

## 🌐 Producción

El proyecto se despliega automáticamente en Netlify cuando se hace push a `main`.

**URL de producción:** https://mapaclientesbackend.netlify.app

## 📋 Endpoints Disponibles

### Health Check
- `GET /api/ping` - Verificar estado del servidor

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `POST /api/clientes` - Crear nuevo cliente

### Info General
- `GET /api` - Información general de la API

## 🔧 Tecnologías

- **Runtime:** Node.js + Express.js
- **Deployment:** Netlify Functions
- **CORS:** Habilitado para todas las origins
- **Format:** ES6 Modules

## 📁 Schema de Base de Datos

Los archivos SQL en `schema/` contienen la estructura para una futura implementación con PostgreSQL:

- `core.sql` - Configuración básica
- `clientes.sql` - Tabla de clientes
- `camiones.sql` - Tabla de camiones
- `dias_entrega.sql` - Tabla de días de entrega
- `camiones_dias.sql` - Relación camiones-días

## 🚀 Siguiente Pasos

1. Configurar base de datos PostgreSQL (ej: Supabase)
2. Agregar variables de entorno (`DATABASE_URL`)
3. Implementar operaciones CRUD reales
4. Agregar autenticación si es necesario
