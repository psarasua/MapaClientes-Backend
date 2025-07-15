// Ejemplo de archivo con errores que ESLint detectaría

// ❌ Error 1: Uso de CommonJS en ES Module
if (require.main === module) {
  console.log('Este es el archivo principal');
}

// ❌ Error 2: Uso de module.exports en ES Module  
module.exports = {
  test: 'value',
};

// ❌ Error 3: Uso de require en ES Module
const fs = require('fs');

// ❌ Error 4: Variable no utilizada
const unusedVariable = 'test';

// ✅ Correcto: ES Module syntax
export default function myFunction() {
  console.log('Función exportada correctamente');
}

// ✅ Correcto: Import ES Module
import { Pool } from 'pg';
