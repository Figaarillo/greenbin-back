import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type NeighborPayload from '../../domain/payloads/neighbor.payload'
import type NeighborHandler from '../handlers/neighbor.handler'
import { updateSwaggerSchema } from '../swagger-schemas/neighbor.swagger-schema'

class NeighborRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: NeighborHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/neighbor', {
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    })

    this.server.get('/api/neighbor/:id', {
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply) => {
        await this.handler.findById(req, rep)
      }
    })
    this.server.get('/api/neighbor/dni/:dni', {
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply) => {
        await this.handler.findByDni(req, rep)
      }
    })
    this.server.post('/api/neighbor', async (req: FastifyRequest<{ Body: NeighborPayload }>, rep) => {
      await this.handler.register(req, rep)
    })

    this.server.put('/api/neighbor/:id', {
      schema: updateSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply) => {
        await this.handler.update(req, rep)
      }
    })

    this.server.post('/api/neighbor/auth/login', async (req, rep) => {
      await this.handler.login(req, rep)
    })

    this.server.get('/api/neighbor/auth/refresh-token', {
      preHandler: this.server.auth([this.server.validateRefreshToken]),
      handler: async (req: FastifyRequest, rep: FastifyReply) => {
        await this.handler.refreshToken(req, rep)
      }
    })

    this.server.get('/api/neighbor/auth/validate-role', {
      preHandler: this.server.auth([this.server.getTokenRole]),
      handler: async (req, rep) => {
        await this.handler.validateRole(req, rep)
      }
    })
    this.server.get('/api/neighbor/get-waste/:id', {
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply) => {
        await this.handler.getWastes(req, rep)
      }
    })
  }
}

export default NeighborRoute
