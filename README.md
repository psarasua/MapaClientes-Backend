# 🗺️ MapaClientes Backend API

API robusta y profesional para la gestión de clientes con geolocalización, construida con Express.js y PostgreSQL, desplegada en Netlify Functions.

## 🚀 Características

- ✅ CRUD completo para gestión de clientes
- 📍 Soporte para coordenadas geográficas (x, y)
- 🔍 Búsqueda y filtrado avanzado
- 📄 Paginación de resultados
- ✨ Validación robusta de datos
- 🔗 Conexión segura a PostgreSQL (Neon)
- 📊 Health checks y monitoring
- 🛡️ Manejo profesional de errores
- 📝 Logging detallado
- 🌐 CORS configurado
- 🔧 Arquitectura modular y escalable

## 🏗️ Arquitectura

```
MapaClientes-Backend/
├── config/
│   └── database.js         # Configuración de PostgreSQL
├── middleware/
│   └── index.js           # Configuración centralizada de middleware
├── routes/
│   ├── clientes.js        # Rutas de clientes
│   ├── ping.js           # Health check básico
│   └── health.js         # Health check completo
├── utils/
│   ├── responses.js      # Respuestas estandarizadas
│   └── validation.js     # Validaciones de datos
├── netlify/functions/
│   └── api.js           # Función principal de Netlify
└── schema/
    └── *.sql           # Esquemas de base de datos
```

## � Base de Datos

### Tabla: `clientes`

| Campo                | Tipo                  | Descripción                 |
| -------------------- | --------------------- | --------------------------- |
| `id`                 | SERIAL PRIMARY KEY    | ID único del cliente        |
| `codigo_alternativo` | VARCHAR(50)           | Código alternativo opcional |
| `nombre`             | VARCHAR(100) NOT NULL | Nombre del cliente          |
| `razon`              | VARCHAR(100)          | Razón social                |
| `direccion`          | VARCHAR(200)          | Dirección física            |
| `telefono`           | VARCHAR(30)           | Número de teléfono          |
| `rut`                | VARCHAR(30)           | RUT/Identificación fiscal   |
| `activo`             | BOOLEAN DEFAULT TRUE  | Estado del cliente          |
| `x`                  | DOUBLE PRECISION      | Coordenada X (longitud)     |
| `y`                  | DOUBLE PRECISION      | Coordenada Y (latitud)      |

## 🛠️ API Endpoints

### 🏥 Health & Status

#### `GET /api`

Información general de la API

#### `GET /api/ping`

Health check con información de base de datos

#### `GET /api/health`

Health check completo del sistema

### 👥 Gestión de Clientes

#### `GET /api/clientes`

Obtener clientes con paginación y filtros

**Query Parameters:**

- `page` (number): Página actual (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `search` (string): Búsqueda en nombre, razón y dirección
- `activo` (boolean): Filtrar por estado activo

#### `GET /api/clientes/:id`

Obtener cliente específico por ID

#### `POST /api/clientes`

Crear nuevo cliente

#### `PUT /api/clientes/:id`

Actualizar cliente completo

#### `PATCH /api/clientes/:id`

Actualizar cliente parcialmente

#### `DELETE /api/clientes/:id`

Eliminar cliente

#### `GET /api/clientes/:id/ubicacion`

Obtener solo la ubicación geográfica del cliente

## 🔧 Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Construcción
npm run build
```

## 🌐 Despliegue

La API está desplegada en Netlify Functions y se conecta automáticamente a una base de datos PostgreSQL en Neon.

**URL Base:** `https://mapaclientesbackend.netlify.app/api`

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
