// seeders/relacionesSeeder.js
import prisma from '../lib/prisma.js';

export async function seedCamionesDias() {
  console.log('🔗 Creando relaciones camiones-días...');

  // Obtener todos los camiones y días
  const camiones = await prisma.camiones.findMany();
  const dias = await prisma.diasEntrega.findMany();

  // Crear relaciones de ejemplo
  const relaciones = [
    { camionId: camiones[0]?.id, diaEntregaId: dias[0]?.id }, // Camión 1 -> Lunes
    { camionId: camiones[0]?.id, diaEntregaId: dias[1]?.id }, // Camión 1 -> Martes
    { camionId: camiones[1]?.id, diaEntregaId: dias[2]?.id }, // Camión 2 -> Miércoles
    { camionId: camiones[1]?.id, diaEntregaId: dias[3]?.id }, // Camión 2 -> Jueves
    { camionId: camiones[2]?.id, diaEntregaId: dias[4]?.id }, // Camión 3 -> Viernes
  ].filter(rel => rel.camionId && rel.diaEntregaId);

  const promises = relaciones.map(relacion =>
    prisma.camionDia.upsert({
      where: {
        camionId_diaEntregaId: {
          camionId: relacion.camionId,
          diaEntregaId: relacion.diaEntregaId,
        },
      },
      update: {},
      create: relacion,
    }),
  );

  await Promise.all(promises);
  console.log('✅ Relaciones camiones-días creadas exitosamente');
}
