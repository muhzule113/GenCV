import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GenCV API',
      version: '1.0.0',
      description: 'API untuk CV Builder & Surat Lamaran dengan AI',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
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
            error: { type: 'string' },
          },
        },
        Letter: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            cv_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            position: { type: 'string' },
            company: { type: 'string' },
            content: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        CV: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            template_id: { type: 'string' },
            user_id: { type: 'string', format: 'uuid' },
            data: { type: 'object' },
            share_token: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/server/routes/*.js', './src/server/controllers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
