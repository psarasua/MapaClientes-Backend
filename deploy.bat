@echo off
REM Script de deployment para Fly.io - Windows
REM Este script automatiza el proceso de deployment

echo 🚀 Iniciando deployment en Fly.io...

REM Verificar si fly CLI está instalado
fly version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Fly CLI no está instalado. Instálalo desde https://fly.io/install
    exit /b 1
)

REM Verificar autenticación
fly auth whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ No estás autenticado en Fly.io. Ejecuta 'fly auth login'
    exit /b 1
)

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ No se encontró package.json. Ejecuta este script desde la raíz del proyecto.
    exit /b 1
)

echo ✅ Verificaciones iniciales completadas

REM Opcional: Ejecutar lint
echo 🔍 Ejecutando linter...
npm run lint
if %errorlevel% neq 0 (
    echo ⚠️ Linter falló, pero continuando...
)

echo 📦 Construyendo aplicación...
npm run build

echo 🚀 Desplegando en Fly.io...
fly deploy

echo ✅ Deployment completado!
echo 🌐 Tu aplicación está disponible en: https://mapclientes-backend.fly.dev
echo 🏥 Health check: https://mapclientes-backend.fly.dev/api/health

REM Mostrar logs después del deployment
echo 📊 Mostrando logs recientes...
fly logs --lines 50
