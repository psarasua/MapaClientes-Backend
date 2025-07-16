# 🔍 Guía de Linting y Calidad de Código

## ESLint Configurado

Este proyecto utiliza ESLint para mantener la calidad del código y prevenir errores comunes, especialmente relacionados con ES Modules.

## 🚀 Comandos Disponibles

```bash
# Verificar todo el código
npm run lint

# Corregir automáticamente errores que se pueden arreglar
npm run lint:fix
```

## 🛡️ Reglas Importantes

### ES Modules

- ❌ **Prohibido**: `module.exports`, `require()`, `exports`
- ✅ **Usar**: `import`, `export`

### Ejemplos de Errores Detectados

```javascript
// ❌ Error - CommonJS en ES Module
if (require.main === module) {
  console.log("archivo principal");
}

// ✅ Correcto - ES Module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("archivo principal");
}
```

```javascript
// ❌ Error - module no definido en ES Module
module.exports = function () {};

// ✅ Correcto - ES Module
export default function () {}
```

## 🔧 Configuración por Tipo de Archivo

- **Netlify Functions** (`netlify/functions/`): Reglas específicas para serverless
- **Seeders** (`seeders/`): Permiten console.log para debugging
- **Config** (`config/`): Configuración para archivos de configuración

## 🔗 Integración con VS Code

1. Instala la extensión ESLint
2. El código se validará automáticamente
3. Los errores se corregirán al guardar (si es posible)

## 🚨 Errores Comunes y Soluciones

### 1. "module is not defined"

```javascript
// ❌ Problema
if (require.main === module) {
}

// ✅ Solución ES Module
if (import.meta.url === `file://${process.argv[1]}`) {
}

// ✅ Alternativa más simple - remover la verificación
// No necesario en contexto de Netlify Functions
```

### 2. "require is not defined"

```javascript
// ❌ Problema
const fs = require("fs");

// ✅ Solución
import fs from "fs";
```

### 3. Variables no utilizadas

```javascript
// ❌ Warning
const pool = new Pool();

// ✅ Solución - usar _ para ignorar
const _pool = new Pool(); // Si realmente no se usa
```

## 📋 Pre-commit Hook

El proyecto incluye un hook de pre-commit que:

- Ejecuta ESLint antes de cada commit
- Bloquea commits con errores
- Sugiere `npm run lint:fix` para correcciones automáticas

## 🎯 Beneficios

1. **Prevención de errores**: Detecta problemas antes del deploy
2. **Consistencia**: Mantiene estilo uniforme de código
3. **ES Module compliance**: Evita mezclar CommonJS con ES Modules
4. **Mejor DX**: Errores claros con sugerencias de corrección

## 🔍 Verificación Manual

Para verificar un archivo específico:

```bash
npx eslint netlify/functions/api.js
```

Para corregir un archivo específico:

```bash
npx eslint netlify/functions/api.js --fix
```
