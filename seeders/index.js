// seeders/index.js
import prisma from '../lib/prisma.js';
import { seedCamiones } from './camionesSeeder.js';
import { seedDiasEntrega } from './diasSeeder.js';
import { seedClientes } from './clientesSeeder.js';
import { seedCamionesDias } from './relacionesSeeder.js';
import { usuariosSeeder } from './usuariosSeeder.js';

async function main() {
  try {
    console.log('🌱 Iniciando proceso de seeding con Prisma...');

    await seedDiasEntrega();
    await seedCamiones();
    await seedClientes();
    await seedCamionesDias();
    await usuariosSeeder();

    console.log('🎉 Seeding completado exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
