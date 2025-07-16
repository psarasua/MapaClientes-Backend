// models/diasEntregaModel.js
import prisma from '../lib/prisma.js';

// Obtener todos los días de entrega
export async function getAllDiasEntrega() {
  return await prisma.diasEntrega.findMany({
    orderBy: { descripcion: 'asc' },
    include: {
      camionesDias: {
        include: {
          camion: true,
        },
      },
    },
  });
}

// Obtener día de entrega por ID
export async function getDiaEntregaById(id) {
  const diaEntrega = await prisma.diasEntrega.findUnique({
    where: { id: parseInt(id) },
    include: {
      camionesDias: {
        include: {
          camion: true,
        },
      },
    },
  });

  if (!diaEntrega) {
    throw new Error('Día de entrega no encontrado');
  }

  return diaEntrega;
}

// Crear nuevo día de entrega
export async function createDiaEntrega(diaEntregaData) {
  return await prisma.diasEntrega.create({
    data: {
      descripcion: diaEntregaData.descripcion,
    },
  });
}

// Actualizar día de entrega
export async function updateDiaEntrega(id, diaEntregaData) {
  const existingDiaEntrega = await prisma.diasEntrega.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingDiaEntrega) {
    throw new Error('Día de entrega no encontrado');
  }

  return await prisma.diasEntrega.update({
    where: { id: parseInt(id) },
    data: {
      descripcion: diaEntregaData.descripcion,
    },
  });
}

// Eliminar día de entrega
export async function deleteDiaEntrega(id) {
  const existingDiaEntrega = await prisma.diasEntrega.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingDiaEntrega) {
    throw new Error('Día de entrega no encontrado');
  }

  // Eliminar primero las relaciones
  await prisma.camionDia.deleteMany({
    where: { diaEntregaId: parseInt(id) },
  });

  // Luego eliminar el día de entrega
  return await prisma.diasEntrega.delete({
    where: { id: parseInt(id) },
  });
}

// Obtener días de entrega con sus camiones
export async function getDiasEntregaConCamiones() {
  return await prisma.diasEntrega.findMany({
    include: {
      camionesDias: {
        include: {
          camion: true,
        },
        orderBy: {
          camion: {
            descripcion: 'asc',
          },
        },
      },
    },
    orderBy: { descripcion: 'asc' },
  });
}

// Obtener días de entrega disponibles (sin formato específico)
export async function getDiasEntregaDisponibles() {
  return await prisma.diasEntrega.findMany({
    select: {
      id: true,
      descripcion: true,
    },
    orderBy: { descripcion: 'asc' },
  });
}

// Obtener camiones asignados a un día de entrega
export async function getCamionesDia(diaEntregaId) {
  const diaEntrega = await prisma.diasEntrega.findUnique({
    where: { id: parseInt(diaEntregaId) },
    include: {
      camionesDias: {
        include: {
          camion: true,
        },
      },
    },
  });

  if (!diaEntrega) {
    throw new Error('Día de entrega no encontrado');
  }

  return diaEntrega.camionesDias.map((cd) => cd.camion);
}

// Asignar camiones a un día de entrega
export async function asignarCamionesADia(diaEntregaId, camionesIds) {
  // Verificar que el día de entrega existe
  const diaEntrega = await prisma.diasEntrega.findUnique({
    where: { id: parseInt(diaEntregaId) },
  });

  if (!diaEntrega) {
    throw new Error('Día de entrega no encontrado');
  }

  // Eliminar asignaciones anteriores
  await prisma.camionDia.deleteMany({
    where: { diaEntregaId: parseInt(diaEntregaId) },
  });

  // Crear nuevas asignaciones
  const asignaciones = camionesIds.map((camionId) => ({
    camionId: parseInt(camionId),
    diaEntregaId: parseInt(diaEntregaId),
  }));

  return await prisma.camionDia.createMany({
    data: asignaciones,
  });
}
