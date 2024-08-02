// src/config/swagger.config.ts
import { type SwaggerOptions } from '@fastify/swagger'

const SwaggerConfig: SwaggerOptions = {
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

export default SwaggerConfig
