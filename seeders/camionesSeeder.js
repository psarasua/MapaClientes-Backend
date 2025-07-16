// seeders/camionesSeeder.js
import prisma from '../lib/prisma.js';

export async function seedCamiones() {
  console.log('🚚 Creando camiones...');

  const camiones = [
    { descripcion: 'Camión Reparto Centro' },
    { descripcion: 'Camión Reparto Norte' },
    { descripcion: 'Camión Reparto Sur' },
    { descripcion: 'Camión Reparto Este' },
    { descripcion: 'Camión Reparto Oeste' },
  ];

  try {
    await prisma.camiones.createMany({
      data: camiones,
      skipDuplicates: true,
    });
  } catch {
    console.log('⚠️  Algunos camiones ya existen, continuando...');
  }

  console.log('✅ Camiones creados exitosamente');
}
