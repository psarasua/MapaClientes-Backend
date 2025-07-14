// config/dbInit.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual de manera compatible
const getCurrentDir = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    return path.dirname(__filename);
  } catch (error) {
    // Fallback para entornos que no soportan import.meta.url
    return process.cwd();
  }
};

const __dirname = getCurrentDir();

/**
 * Inicializa la base de datos creando las tablas si no existen
 * @param {Pool} pool - Pool de conexiones de PostgreSQL
 */
export const initializeDatabase = async (pool) => {
  try {
    console.log('🔄 Iniciando verificación y creación de tablas...');
    
    // Orden de creación de tablas (respetando las dependencias)
    const schemaFiles = [
      'dias_entrega.sql',
      'camiones.sql', 
      'clientes.sql',
      'camiones_dias.sql'
    ];

    // Ruta al directorio de esquemas - buscar en múltiples ubicaciones
    let schemaDir = path.join(__dirname, '..', 'schema');
    
    // Si no existe, intentar desde la raíz del proyecto
    if (!fs.existsSync(schemaDir)) {
      schemaDir = path.join(process.cwd(), 'schema');
    }
    
    // Si aún no existe, intentar ubicaciones alternativas
    if (!fs.existsSync(schemaDir)) {
      const alternativePaths = [
        path.join(__dirname, '..', '..', 'schema'),
        path.join(__dirname, 'schema'),
        path.resolve('./schema')
      ];
      
      for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
          schemaDir = altPath;
          break;
        }
      }
    }
    
    console.log(`📁 Directorio de esquemas: ${schemaDir}`);
    
    if (!fs.existsSync(schemaDir)) {
      throw new Error(`Directorio de esquemas no encontrado. Verificado en: ${schemaDir}`);
    }

    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      
      try {
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  Archivo de esquema no encontrado: ${file}`);
          continue;
        }

        // Leer el contenido del archivo SQL
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        // Ejecutar el SQL solo si no está vacío
        if (sqlContent.trim() && !sqlContent.includes('-- Este archivo ha sido dejado en blanco')) {
          await pool.query(sqlContent);
          console.log(`✅ Tabla creada/verificada desde: ${file}`);
        }
      } catch (fileError) {
        console.error(`❌ Error procesando ${file}:`, fileError.message);
        throw fileError;
      }
    }

    // Verificar que las tablas fueron creadas correctamente
    const tablesQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    const result = await pool.query(tablesQuery);
    const tables = result.rows.map(row => row.tablename);
    
    console.log('📊 Tablas disponibles en la base de datos:');
    tables.forEach(table => {
      console.log(`  - ${table}`);
    });

    console.log('✅ Inicialización de base de datos completada exitosamente');
    
    return {
      success: true,
      tables: tables,
      message: 'Base de datos inicializada correctamente'
    };

  } catch (error) {
    console.error('❌ Error en la inicialización de la base de datos:', error);
    throw error;
  }
};

/**
 * Verifica si una tabla específica existe
 * @param {Pool} pool - Pool de conexiones de PostgreSQL
 * @param {string} tableName - Nombre de la tabla a verificar
 * @returns {boolean} - True si la tabla existe
 */
export const checkTableExists = async (pool, tableName) => {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `;
    
    const result = await pool.query(query, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error verificando existencia de tabla ${tableName}:`, error);
    return false;
  }
};

/**
 * Obtiene información sobre las tablas existentes
 * @param {Pool} pool - Pool de conexiones de PostgreSQL
 * @returns {Array} - Lista de tablas con información
 */
export const getDatabaseInfo = async (pool) => {
  try {
    const query = `
      SELECT 
        t.table_name,
        t.table_type,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name, c.ordinal_position;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo información de la base de datos:', error);
    throw error;
  }
};
