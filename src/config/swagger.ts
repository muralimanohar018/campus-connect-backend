import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const isProduction = env.NODE_ENV === 'production';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Campus Connect API',
      version: '1.0.0',
      description:
        'REST API foundation for Campus Connect — a Coding Club Management Platform. ' +
        'This documents the authentication and core foundation endpoints. Feature ' +
        'modules (Events, Certificates, Attendance, etc.) will extend this spec.',
    },

    servers: [
      {
        url: isProduction
          ? `https://campus-connect-backend-lln0.onrender.com${env.API_PREFIX}`
          : `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: isProduction
          ? 'Production server'
          : 'Local development server',
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
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
              nullable: true,
            },
            pagination: {
              type: 'object',
              nullable: true,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ['./src/routes/**/*.ts', './src/docs/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);