// seeders/index.js
// Archivo principal para ejecutar todos los seeders

import { seedCamiones } from './camionesSeeder.js';
import { seedDiasEntrega } from './diasEntregaSeeder.js';
// import { seedCamionesDias } from './camionesDiasSeeder.js';
// import { seedCore } from './coreSeeder.js';

export async function runAllSeeders() {
  try {
    console.log('🌱 Iniciando proceso de seeding...');

    await seedCamiones();
    await seedDiasEntrega();
    // await seedCamionesDias();
    // await seedCore();

    console.log('✅ Todos los seeders ejecutados exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente desde Node.js
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('index.js')) {
  runAllSeeders()
    .then(() => {
      console.log('🎉 Seeding completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error en seeding:', error);
      process.exit(1);
    });
}
