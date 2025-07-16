#!/bin/bash

# Script de deployment para Fly.io
# Este script automatiza el proceso de deployment

set -e

echo "🚀 Iniciando deployment en Fly.io..."

# Verificar si fly CLI está instalado
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI no está instalado. Instálalo desde https://fly.io/install"
    exit 1
fi

# Verificar autenticación
if ! fly auth whoami &> /dev/null; then
    echo "❌ No estás autenticado en Fly.io. Ejecuta 'fly auth login'"
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

echo "✅ Verificaciones iniciales completadas"

# Opcional: Ejecutar tests (descomenta si tienes tests)
# echo "🧪 Ejecutando tests..."
# npm test

# Opcional: Ejecutar lint
echo "🔍 Ejecutando linter..."
npm run lint

echo "📦 Construyendo aplicación..."
npm run build

echo "🚀 Desplegando en Fly.io..."
fly deploy

echo "✅ Deployment completado!"
echo "🌐 Tu aplicación está disponible en: https://mapclientes-backend.fly.dev"
echo "🏥 Health check: https://mapclientes-backend.fly.dev/api/health"

# Mostrar logs después del deployment
echo "📊 Mostrando logs recientes..."
fly logs --lines 50
