// models/usuariosModel.js
import prisma from '../lib/prisma.js';

export const usuariosModel = {
  // Obtener todos los usuarios con paginación y filtros
  async getAll(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      rol = '',
      activo = '',
    } = filters;

    const skip = (page - 1) * limit;
    
    const where = {};

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro por rol
    if (rol) {
      where.rol = rol;
    }

    // Filtro por estado activo
    if (activo !== '') {
      where.activo = activo === 'true';
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuarios.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          rol: true,
          activo: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          // Excluir password por seguridad
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.usuarios.count({ where }),
    ]);

    return {
      usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Obtener usuario por ID
  async getById(id) {
    return await prisma.usuarios.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Obtener usuario por email (para login)
  async getByEmail(email) {
    return await prisma.usuarios.findUnique({
      where: { email },
    });
  },

  // Crear nuevo usuario
  async create(userData) {
    return await prisma.usuarios.create({
      data: userData,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Actualizar usuario
  async update(id, userData) {
    return await prisma.usuarios.update({
      where: { id: parseInt(id) },
      data: {
        ...userData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Eliminar usuario (soft delete)
  async delete(id) {
    return await prisma.usuarios.update({
      where: { id: parseInt(id) },
      data: { 
        activo: false,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
      },
    });
  },

  // Eliminar usuario permanentemente
  async hardDelete(id) {
    return await prisma.usuarios.delete({
      where: { id: parseInt(id) },
    });
  },

  // Actualizar último login
  async updateLastLogin(id) {
    return await prisma.usuarios.update({
      where: { id: parseInt(id) },
      data: { 
        lastLogin: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        lastLogin: true,
      },
    });
  },

  // Verificar si existe un usuario con el email
  async existsByEmail(email, excludeId = null) {
    const where = { email };
    if (excludeId) {
      where.id = { not: parseInt(excludeId) };
    }
    
    const count = await prisma.usuarios.count({ where });
    return count > 0;
  },

  // Obtener estadísticas de usuarios
  async getStats() {
    const [total, activos, inactivos, porRol] = await Promise.all([
      prisma.usuarios.count(),
      prisma.usuarios.count({ where: { activo: true } }),
      prisma.usuarios.count({ where: { activo: false } }),
      prisma.usuarios.groupBy({
        by: ['rol'],
        _count: {
          rol: true,
        },
      }),
    ]);

    return {
      total,
      activos,
      inactivos,
      porRol: porRol.reduce((acc, item) => {
        acc[item.rol] = item._count.rol;
        return acc;
      }, {}),
    };
  },
};

export default usuariosModel;
