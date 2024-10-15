import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type EntityHandler from '../handlers/entity.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/entity.swagger-schema'

class EntityRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: EntityHandler
  ) {}

  setupRoutes(): void {
    this.server.get(
      '/api/entity',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
        await this.handler.list(req, res)
      }
    )
    this.server.get(
      '/api/entity/:id',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.findByID(req, res)
      }
    )
    this.server.post('/api/entity', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.register(req, res)
    })
    this.server.put(
      '/api/entity/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.update(req, res)
      }
    )
    this.server.delete(
      '/api/entity/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.delete(req, res)
      }
    )
    this.server.post('/api/entity/auth/login', async (req, rep) => {
      await this.handler.login(req, rep)
    })
    this.server.get('/api/entity/auth/refresh-token', {
      preHandler: this.server.auth([this.server.validateRefreshToken]),
      handler: async (req, rep) => {
        await this.handler.refreshToken(req, rep)
      }
    })
    this.server.get('/api/entity/auth/validate-role', {
      preHandler: this.server.auth([this.server.getTokenRole]),
      handler: async (req, rep) => {
        await this.handler.validateRole(req, rep)
      }
    })
  }
}

export default EntityRoute
