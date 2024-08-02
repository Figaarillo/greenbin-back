// src/config/swagger.config.ts
import { type SwaggerOptions } from '@fastify/swagger'
import { type FastifySwaggerUiOptions } from '@fastify/swagger-ui'

export const SwaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Test swagger',
      description: 'Testing the Fastify swagger API',
      version: '0.1.0'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'user', description: 'User related end-points' },
      { name: 'code', description: 'Code related end-points' }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      }
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    }
  }
}

export const SwaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header: any) => header,
  transformSpecification: (swaggerObject: any, _request: any, _reply: any) => {
    return swaggerObject
  },
  transformSpecificationClone: true
}
