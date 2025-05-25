import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from '../../config/config';

// Opciones de configuración de Swagger
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZenTurno API',
      version: '1.0.0',
      description: 'API RESTful para la gestión de citas en ZenTurno',
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
      contact: {
        name: 'Equipo ZenTurno',
        url: 'https://zenturno.com',
        email: 'contact@zenturno.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.zenturno.com/api',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Mensaje de error',
            },
          },
        },
        // Definiciones de esquemas que se pueden reutilizar en toda la documentación
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/infra/http/controllers/*.ts',
    './src/domain/entities/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

/**
 * Configura Swagger para la documentación de la API
 * @param app Aplicación Express
 */
export const setupSwagger = (app: Express): void => {
  // Middleware para la documentación Swagger
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'ZenTurno API Documentation',
    })
  );
  
  // Endpoint para obtener la especificación en formato JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}; 