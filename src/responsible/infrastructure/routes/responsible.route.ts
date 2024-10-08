import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type ResponsibleHandler from '../handler/responsible.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schema/responsible.swagger-schema'

class ResponsibleRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: ResponsibleHandler
  ) {}

  setupRoutes(): void {
    this.router.get(
      '/api/responsible',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
        await this.handler.list(req, res)
      }
    )
    this.router.get(
      '/api/responsible/:id',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.findByID(req, res)
      }
    )
    this.router.post('/api/responsible', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.register(req, res)
    })
    this.router.put(
      '/api/responsible/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.update(req, res)
      }
    )
    this.router.delete(
      '/api/responsible/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.delete(req, res)
      }
    )
    this.router.post('/api/responsible/auth/login', async (req, res) => {
      await this.handler.login(req, res)
    })
    this.router.get('/api/responsible/auth/refresh-token', {
      preHandler: this.router.auth([this.router.validateRefreshToken]),
      handler: async (req: FastifyRequest, res: FastifyReply) => {
        await this.handler.refreshToken(req, res)
      }
    })
    this.router.get('/api/responsible/auth/validate-token', {
      preHandler: this.router.auth([this.router.getTokenRole]),
      handler: async (req, res) => {
        await this.handler.validateRole(req, res)
      }
    })
  }
}

export default ResponsibleRoute
