import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Mapas Clientes',
    version: '1.0.0',
    description: 'Documentación de la API para Mapas Clientes',
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: 'Servidor local',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
