import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Management System (EMS) API',
      version: '1.0.0',
      description: 'API documentation and interactive testing playground for the EMS Backend.',
    },
    servers: [
      {
        url: '/',
        description: 'Dynamic host (resolved automatically)',
      },
      {
        url: 'http://localhost:5000',
        description: 'Localhost',
      },
    ],
    components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        }
    }
},
security: [{ bearerAuth: [] }]
  },
  
  apis: ['./routes/*.js', './controller/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger UI available at http://localhost:5000/api-docs');
};
