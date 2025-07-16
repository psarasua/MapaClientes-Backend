// seeders/diasSeeder.js
import prisma from '../lib/prisma.js';

export async function seedDiasEntrega() {
  console.log('📅 Creando días de entrega...');

  const dias = [
    { descripcion: 'Lunes' },
    { descripcion: 'Martes' },
    { descripcion: 'Miércoles' },
    { descripcion: 'Jueves' },
    { descripcion: 'Viernes' },
  ];

  try {
    await prisma.diasEntrega.createMany({
      data: dias,
      skipDuplicates: true,
    });
  } catch {
    console.log('⚠️  Algunos días ya existen, continuando...');
  }

  console.log('✅ Días de entrega creados exitosamente');
}
