// models/clientesModel.js
import prisma from '../lib/prisma.js';

// Obtener todos los clientes con paginación y filtros
export async function getAllClientes({
  page = 1,
  limit = 10,
  search = '',
  activo = undefined,
}) {
  const skip = (page - 1) * limit;

  // Construir filtros dinámicamente
  const where = {};

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { razon: { contains: search, mode: 'insensitive' } },
      { direccion: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (activo !== undefined) {
    where.activo = activo === 'true';
  }

  // Obtener total de registros
  const total = await prisma.clientes.count({ where });

  // Obtener registros paginados
  const data = await prisma.clientes.findMany({
    where,
    skip,
    take: limit,
    orderBy: { nombre: 'asc' },
    select: {
      id: true,
      codigoAlternativo: true,
      nombre: true,
      razon: true,
      direccion: true,
      telefono: true,
      rut: true,
      activo: true,
      x: true,
      y: true,
    },
  });

  return {
    data,
    total,
  };
}

// Obtener cliente por ID
export async function getClienteById(id) {
  const cliente = await prisma.clientes.findUnique({
    where: { id: parseInt(id) },
  });

  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  return cliente;
}

// Crear nuevo cliente
export async function createCliente(clienteData) {
  // Validar que no exista otro cliente con el mismo RUT
  if (clienteData.rut) {
    const existingClient = await prisma.clientes.findFirst({
      where: { rut: clienteData.rut },
    });

    if (existingClient) {
      throw new Error('Ya existe un cliente con este RUT');
    }
  }

  const cliente = await prisma.clientes.create({
    data: {
      codigoAlternativo: clienteData.codigoAlternativo,
      nombre: clienteData.nombre,
      razon: clienteData.razon,
      direccion: clienteData.direccion,
      telefono: clienteData.telefono,
      rut: clienteData.rut,
      activo: clienteData.activo !== undefined ? clienteData.activo : true,
      x: clienteData.x,
      y: clienteData.y,
    },
  });

  return cliente;
}

// Actualizar cliente
export async function updateCliente(id, clienteData) {
  // Verificar que el cliente existe
  const existingClient = await prisma.clientes.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingClient) {
    throw new Error('Cliente no encontrado');
  }

  // Validar RUT único (excepto el cliente actual)
  if (clienteData.rut && clienteData.rut !== existingClient.rut) {
    const duplicateClient = await prisma.clientes.findFirst({
      where: {
        rut: clienteData.rut,
        NOT: { id: parseInt(id) },
      },
    });

    if (duplicateClient) {
      throw new Error('Ya existe un cliente con este RUT');
    }
  }

  const cliente = await prisma.clientes.update({
    where: { id: parseInt(id) },
    data: {
      codigoAlternativo: clienteData.codigoAlternativo,
      nombre: clienteData.nombre,
      razon: clienteData.razon,
      direccion: clienteData.direccion,
      telefono: clienteData.telefono,
      rut: clienteData.rut,
      activo: clienteData.activo,
      x: clienteData.x,
      y: clienteData.y,
    },
  });

  return cliente;
}

// Eliminar cliente (soft delete)
export async function deleteCliente(id) {
  const cliente = await prisma.clientes.findUnique({
    where: { id: parseInt(id) },
  });

  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  // Soft delete - marcar como inactivo
  return await prisma.clientes.update({
    where: { id: parseInt(id) },
    data: { activo: false },
  });
}

// Eliminar cliente permanentemente
export async function deleteClientePermanente(id) {
  const cliente = await prisma.clientes.findUnique({
    where: { id: parseInt(id) },
  });

  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  return await prisma.clientes.delete({
    where: { id: parseInt(id) },
  });
}

// Obtener clientes activos
export async function getClientesActivos() {
  return await prisma.clientes.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  });
}

// Buscar clientes por término
export async function searchClientes(searchTerm) {
  return await prisma.clientes.findMany({
    where: {
      OR: [
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
        { razon: { contains: searchTerm, mode: 'insensitive' } },
        { direccion: { contains: searchTerm, mode: 'insensitive' } },
        { rut: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    orderBy: { nombre: 'asc' },
  });
}
