# MapaClientes Backend - Despliegue en Netlify

Este proyecto backend de Express.js está configurado para desplegarse como funciones serverless en Netlify.

## 🚀 Pasos para desplegar en Netlify

### 1. Preparación del código
El proyecto ya está configurado con:
- ✅ `netlify.toml` - Configuración de Netlify
- ✅ `netlify/functions/api.js` - Función serverless principal
- ✅ `serverless-http` - Adaptador para Express en serverless
- ✅ Redirects configurados para las rutas API

### 2. Configurar variables de entorno en Netlify

Necesitas configurar estas variables de entorno en tu panel de Netlify:

```
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database
JWT_SECRET=tu_jwt_secret_aqui
NODE_ENV=production
```

### 3. Opciones de despliegue

#### Opción A: Despliegue desde Git (Recomendado)

1. **Sube tu código a un repositorio Git** (GitHub, GitLab, etc.)
2. **Ve a [netlify.com](https://netlify.com) y crea una cuenta**
3. **Conecta tu repositorio:**
   - Click en "New site from Git"
   - Selecciona tu proveedor Git
   - Elige tu repositorio
4. **Configura el build:**
   - Build command: `npm install`
   - Publish directory: (dejar vacío)
5. **Configura las variables de entorno:**
   - Ve a Site settings > Environment variables
   - Agrega todas las variables necesarias
6. **Despliega:** Netlify automáticamente desplegará tu sitio

#### Opción B: Despliegue directo con Netlify CLI

```bash
# Instalar Netlify CLI globalmente (si no lo tienes)
npm install -g netlify-cli

# Autenticarse
netlify login

# Desplegar
netlify deploy --prod
```

### 4. Configurar tu base de datos PostgreSQL

Para producción, necesitas una base de datos PostgreSQL accesible desde internet. Opciones recomendadas:

- **Supabase** (gratis): https://supabase.com
- **Heroku Postgres** (gratis limitado): https://heroku.com
- **Railway** (gratis limitado): https://railway.app
- **Amazon RDS** (de pago)

### 5. Ejecutar las migraciones de base de datos

Una vez que tengas tu base de datos configurada, ejecuta los scripts SQL en la carpeta `schema/`:

```sql
-- Ejecutar en orden:
-- 1. core.sql
-- 2. clientes.sql
-- 3. camiones.sql
-- 4. dias_entrega.sql
-- 5. camiones_dias.sql
```

### 6. Poblar datos iniciales (opcional)

Puedes usar los seeders en la carpeta `seeders/` para poblar datos iniciales.

## 🔧 Desarrollo local con Netlify

Para probar el entorno serverless localmente:

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo de Netlify
npm run dev
```

Esto iniciará el servidor en `http://localhost:8888` simulando el entorno de Netlify.

## 📁 Estructura del proyecto para Netlify

```
proyecto/
├── netlify/
│   └── functions/
│       └── api.js          # Función serverless principal
├── netlify.toml            # Configuración de Netlify
├── routes/                 # Rutas de Express (sin cambios)
├── controllers/            # Controladores (sin cambios)
├── middlewares/            # Middlewares (sin cambios)
└── ...resto del proyecto
```

## 🌐 URLs después del despliegue

Una vez desplegado, tu API estará disponible en:
- Base URL: `https://tu-sitio.netlify.app`
- API Routes: `https://tu-sitio.netlify.app/api/*`
- Documentación: `https://tu-sitio.netlify.app/api/docs`

## ⚠️ Consideraciones importantes

1. **Límites de Netlify Functions:**
   - Timeout: 10 segundos máximo por función
   - Memoria: 1 GB máximo
   - 125,000 invocaciones gratuitas por mes

2. **Conexiones de base de datos:**
   - Las funciones serverless no mantienen conexiones persistentes
   - Se recomienda usar connection pooling configurado para serverless

3. **Cold starts:**
   - Las primeras invocaciones pueden ser más lentas
   - Considera implementar keep-alive si es necesario

## 🐛 Solución de problemas

- **Error de timeout:** Optimiza las consultas de base de datos
- **Error de conexión DB:** Verifica las variables de entorno
- **Error 404:** Revisa la configuración de redirects en `netlify.toml`

¡Listo! Tu backend estará funcionando como funciones serverless en Netlify. 🎉
