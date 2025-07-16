// netlify/functions/clientes.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const page = parseInt(event.queryStringParameters?.page) || 1;
      const limit = parseInt(event.queryStringParameters?.limit) || 10;
      const search = event.queryStringParameters?.search || '';
      const activo = event.queryStringParameters?.activo;

      const skip = (page - 1) * limit;

      // Construir filtros
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

      // Obtener datos
      const [data, total] = await Promise.all([
        prisma.clientes.findMany({
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
        }),
        prisma.clientes.count({ where }),
      ]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Clientes obtenidos exitosamente',
          data: {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          timestamp: new Date().toISOString(),
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Método no permitido',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
