import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from '../../config/config';

// Swagger configuration options
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZenTurno API',
      version: '1.0.0',
      description: 'RESTful API for appointment management in ZenTurno',
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
        description: 'Production server',
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
              example: 'Error message',
            },
          },
        },
        // Schema definitions that can be reused throughout the documentation
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
 * Configures Swagger for API documentation
 * @param app Express Application
 */
export const setupSwagger = (app: Express): void => {
  // Middleware for Swagger documentation
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'ZenTurno API Documentation',
    })
  );
  
  // Endpoint to get the specification in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}; 