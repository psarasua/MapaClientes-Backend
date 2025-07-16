// models/camionesModel.js
import prisma from '../lib/prisma.js';

// Obtener todos los camiones
export async function getAllCamiones() {
  return await prisma.camiones.findMany({
    orderBy: { descripcion: 'asc' },
    include: {
      camionesDias: {
        include: {
          diaEntrega: true,
        },
      },
    },
  });
}

// Obtener camión por ID
export async function getCamionById(id) {
  const camion = await prisma.camiones.findUnique({
    where: { id: parseInt(id) },
    include: {
      camionesDias: {
        include: {
          diaEntrega: true,
        },
      },
    },
  });

  if (!camion) {
    throw new Error('Camión no encontrado');
  }

  return camion;
}

// Crear nuevo camión
export async function createCamion(camionData) {
  return await prisma.camiones.create({
    data: {
      descripcion: camionData.descripcion,
    },
  });
}

// Actualizar camión
export async function updateCamion(id, camionData) {
  const existingCamion = await prisma.camiones.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingCamion) {
    throw new Error('Camión no encontrado');
  }

  return await prisma.camiones.update({
    where: { id: parseInt(id) },
    data: {
      descripcion: camionData.descripcion,
    },
  });
}

// Eliminar camión
export async function deleteCamion(id) {
  const existingCamion = await prisma.camiones.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingCamion) {
    throw new Error('Camión no encontrado');
  }

  // Eliminar primero las relaciones
  await prisma.camionDia.deleteMany({
    where: { camionId: parseInt(id) },
  });

  // Luego eliminar el camión
  return await prisma.camiones.delete({
    where: { id: parseInt(id) },
  });
}

// Obtener camiones con sus días de entrega
export async function getCamionesConDias() {
  return await prisma.camiones.findMany({
    include: {
      camionesDias: {
        include: {
          diaEntrega: true,
        },
        orderBy: {
          diaEntrega: {
            descripcion: 'asc',
          },
        },
      },
    },
    orderBy: { descripcion: 'asc' },
  });
}

// Asignar días de entrega a un camión
export async function asignarDiasACamion(camionId, diasIds) {
  // Verificar que el camión existe
  const camion = await prisma.camiones.findUnique({
    where: { id: parseInt(camionId) },
  });

  if (!camion) {
    throw new Error('Camión no encontrado');
  }

  // Eliminar asignaciones anteriores
  await prisma.camionDia.deleteMany({
    where: { camionId: parseInt(camionId) },
  });

  // Crear nuevas asignaciones
  const asignaciones = diasIds.map((diaId) => ({
    camionId: parseInt(camionId),
    diaEntregaId: parseInt(diaId),
  }));

  return await prisma.camionDia.createMany({
    data: asignaciones,
  });
}

// Obtener días de entrega de un camión
export async function getDiasCamion(camionId) {
  const camion = await prisma.camiones.findUnique({
    where: { id: parseInt(camionId) },
    include: {
      camionesDias: {
        include: {
          diaEntrega: true,
        },
      },
    },
  });

  if (!camion) {
    throw new Error('Camión no encontrado');
  }

  return camion.camionesDias.map((cd) => cd.diaEntrega);
}
