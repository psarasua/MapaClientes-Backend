# 🚀 Guía de Deployment en Fly.io

## Prerequisitos

1. **Instalar Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Crear cuenta en Fly.io**
   ```bash
   fly auth signup
   # O si ya tienes cuenta:
   fly auth login
   ```

## 🗄️ Configuración de Base de Datos

### Crear PostgreSQL en Fly.io
```bash
# Crear base de datos PostgreSQL
fly postgres create --name mapclientes-db --region mia

# Conectar la base de datos a tu app
fly postgres attach mapclientes-db
```

### O usar base de datos externa (Neon, Supabase, etc.)
```bash
# Configurar variable de entorno para base de datos externa
fly secrets set DATABASE_URL="postgresql://usuario:password@host:5432/database"
```

## 🚀 Deployment

### 1. Inicializar aplicación
```bash
# Desde la raíz del proyecto
fly launch

# Esto creará/actualizará fly.toml y configurará la app
```

### 2. Configurar variables de entorno
```bash
# Variables requeridas
fly secrets set NODE_ENV=production
fly secrets set DATABASE_URL="tu_database_url_aquí"

# Variables opcionales
fly secrets set CORS_ORIGIN="https://tu-frontend.com"
```

### 3. Ejecutar migraciones de Prisma
```bash
# Las migraciones se ejecutarán automáticamente en el deploy
# Pero puedes ejecutarlas manualmente si es necesario:
fly ssh console
npm run db:migrate:deploy
exit
```

### 4. Deployar aplicación
```bash
fly deploy
```

## 📊 Monitoreo y Mantenimiento

### Ver logs
```bash
fly logs
```

### Ver estado de la aplicación
```bash
fly status
```

### Conectar vía SSH
```bash
fly ssh console
```

### Escalar aplicación
```bash
# Escalar verticalmente (más memoria/CPU)
fly scale memory 512
fly scale cpu 2

# Escalar horizontalmente (más instancias)
fly scale count 2
```

## 🔍 Health Checks

La aplicación incluye health checks automáticos:
- **Health check endpoint**: `/api/health`
- **Ping endpoint**: `/api/ping`

Fly.io verificará automáticamente estos endpoints para asegurar que la aplicación esté funcionando correctamente.

## 🌐 Dominios Personalizados

```bash
# Agregar dominio personalizado
fly certs add tu-dominio.com
fly certs add www.tu-dominio.com
```

## 🛠️ Comandos útiles

```bash
# Ver información de la aplicación
fly info

# Ver certificados SSL
fly certs list

# Ver secretos (variables de entorno)
fly secrets list

# Reiniciar aplicación
fly restart

# Destruir aplicación (¡cuidado!)
fly destroy
```

## 🔧 Troubleshooting

### 1. Error de conexión a base de datos
```bash
# Verificar que DATABASE_URL esté configurada
fly secrets list

# Verificar conectividad
fly ssh console
npx prisma db push
```

### 2. Error en migraciones
```bash
# Ejecutar migraciones manualmente
fly ssh console
npm run db:migrate:deploy
```

### 3. Aplicación no responde
```bash
# Verificar logs
fly logs

# Verificar estado
fly status

# Reiniciar si es necesario
fly restart
```

## 📝 Notas importantes

1. **Región**: La aplicación está configurada para la región `mia` (Miami), puedes cambiarla en `fly.toml`
2. **Memoria**: Configurada en 256MB, ajusta según necesidades
3. **Auto-scaling**: Configurado para pausar cuando no hay tráfico
4. **HTTPS**: Habilitado automáticamente
5. **Health checks**: Configurados para verificar `/api/health` cada 10 segundos

## 🎯 URL de tu aplicación

Después del deployment, tu aplicación estará disponible en:
`https://mapclientes-backend.fly.dev`

## 📞 Soporte

- [Documentación oficial de Fly.io](https://fly.io/docs/)
- [Comunidad en Discord](https://fly.io/discord)
- [Guía de Node.js en Fly.io](https://fly.io/docs/languages-and-frameworks/node/)
