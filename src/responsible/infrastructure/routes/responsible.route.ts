import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type ResponsibleHandler from '../handlers/responsible.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/responsible.swagger-schema'

class ResponsibleRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: ResponsibleHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/responsible', {
      schema: listSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
        await this.handler.list(req, res)
      }
    })
    this.server.get('/api/responsible/:id', {
      schema: findByIdSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.findByID(req, res)
      }
    })
    this.server.post('/api/responsible', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.register(req, res)
    })
    this.server.put(
      '/api/responsible/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.update(req, res)
      }
    )
    this.server.delete(
      '/api/responsible/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.delete(req, res)
      }
    )
    this.server.post('/api/responsible/auth/login', async (req, res) => {
      await this.handler.login(req, res)
    })
    this.server.get('/api/responsible/auth/refresh-token', {
      preHandler: this.server.auth([this.server.validateRefreshToken]),
      handler: async (req: FastifyRequest, res: FastifyReply) => {
        await this.handler.refreshToken(req, res)
      }
    })
    this.server.get('/api/responsible/auth/validate-role', {
      preHandler: this.server.auth([this.server.getTokenRole]),
      handler: async (req, res) => {
        await this.handler.validateRole(req, res)
      }
    })
  }
}

export default ResponsibleRoute
