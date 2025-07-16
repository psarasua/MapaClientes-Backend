// netlify/functions/test.js
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
    // Probar conexión a la base de datos
    const clientes = await prisma.clientes.findMany({
      take: 5,
      select: {
        id: true,
        nombre: true,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Función de prueba funcionando',
        data: clientes,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Error en función de prueba',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
