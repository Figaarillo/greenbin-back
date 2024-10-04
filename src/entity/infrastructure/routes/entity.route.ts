import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type EntityHandler from '../handler/entity.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/entity.swagger-schema'

class EntityRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: EntityHandler
  ) {}

  setupRoutes(): void {
    this.router.get(
      '/api/entity',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
        await this.handler.list(req, res)
      }
    )
    this.router.get(
      '/api/entity/:id',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.findByID(req, res)
      }
    )
    this.router.post('/api/entity', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.register(req, res)
    })
    this.router.put(
      '/api/entity/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.update(req, res)
      }
    )
    this.router.delete(
      '/api/entity/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.delete(req, res)
      }
    )
    this.router.get('/api/entity/auth/refresh-token', {
      preHandler: this.router.auth([this.router.validateRefreshToken]),
      handler: async (req, rep) => {
        await this.handler.refreshToken(req, rep)
      }
    })
  }
}

export default EntityRoute
