import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type ResponsibleHandler from '../handlers/responsible.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/responsible.swagger-schema'
import type ResponsiblePayload from '../../domain/payloads/responsible.payload'

class ResponsibleRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: ResponsibleHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/responsible', {
      schema: listSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    })
    this.server.get('/api/responsible/:id', {
      schema: findByIdSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    })
    this.server.post(
      '/api/responsible',
      { schema: registerSwaggerSchema },
      async (req: FastifyRequest<{ Body: ResponsiblePayload }>, rep) => {
        await this.handler.register(req, rep)
      }
    )
    this.server.put(
      '/api/responsible/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Body: ResponsiblePayload; Params: { id: string } }>, rep) => {
        await this.handler.update(req, rep)
      }
    )
    this.server.delete(
      '/api/responsible/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.delete(req, rep)
      }
    )
    this.server.post('/api/responsible/auth/login', async (req: FastifyRequest<{ Body: ResponsiblePayload }>, rep) => {
      await this.handler.login(req, rep)
    })
    this.server.get('/api/responsible/auth/refresh-token', {
      preHandler: this.server.auth([this.server.validateRefreshToken]),
      handler: async (req: FastifyRequest, rep: FastifyReply) => {
        await this.handler.refreshToken(req, rep)
      }
    })
    this.server.get('/api/responsible/auth/validate-role', {
      preHandler: this.server.auth([this.server.getTokenRole]),
      handler: async (req, rep) => {
        await this.handler.validateRole(req, rep)
      }
    })
  }
}

export default ResponsibleRoute
