import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      // Reglas específicas para ES Modules
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      
      // Prevenir uso de CommonJS en ES modules
      'no-global-assign': 'error',
      'no-implicit-globals': 'error',
      
      // Reglas para imports/exports
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
  },
  
  // Configuración específica para archivos de Netlify Functions
  {
    files: ['netlify/functions/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Permitir console.log en functions
    },
  },
  
  // Configuración para seeders
  {
    files: ['seeders/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  
  // Configuración para archivos de configuración
  {
    files: ['config/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
  },
  
  // Ignorar archivos específicos
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '.netlify/',
      '*.min.js',
      '*.min.css',
      '*.tmp',
      '*.temp',
      '.DS_Store',
      'Thumbs.db',
      '.vscode/',
      '.idea/',
      '.env',
      '.env.local',
      '.env.production',
      '.env.development',
      'docs/generated/',
      'example-errors.js', // Archivo de ejemplo con errores intencionales
    ],
  },
];
