export default {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Reglas específicas para ES Modules
    'no-undef': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    
    // Prevenir uso de CommonJS en ES modules
    'no-global-assign': 'error',
    'no-implicit-globals': 'error',
    
    // Reglas para imports/exports
    'import/no-unresolved': 'off', // Desactivado para evitar problemas con rutas relativas
    'no-duplicate-imports': 'error',
    
    // Detectar uso incorrecto de module/require en ES modules
    'no-restricted-globals': [
      'error',
      {
        name: 'module',
        message: 'Use ES modules (import/export) instead of CommonJS (module.exports/require)',
      },
      {
        name: 'require',
        message: 'Use ES modules (import) instead of CommonJS (require)',
      },
      {
        name: 'exports',
        message: 'Use ES modules (export) instead of CommonJS (exports)',
      },
    ],
    
    // Reglas para async/await
    'require-await': 'warn',
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    
    // Reglas de calidad de código
    'no-console': 'off', // Permitido para logging en servidor
    'no-debugger': 'error',
    'no-alert': 'error',
    
    // Reglas de estilo
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    
    // Reglas específicas para Netlify Functions
    'no-process-exit': 'warn', // Advertencia en lugar de error para serverless
  },
  
  // Configuración específica para diferentes tipos de archivos
  overrides: [
    {
      // Configuración para archivos de Netlify Functions
      files: ['netlify/functions/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'no-console': 'off', // Permitir console.log en functions
        'no-process-env': 'off', // Permitir process.env
      },
    },
    {
      // Configuración para seeders
      files: ['seeders/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Configuración para archivos de configuración
      files: ['config/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
    },
  ],
  
  // Ignorar archivos específicos
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.netlify/',
    '*.min.js',
  ],
};
