import { type FastifyInstance, type FastifyRequest } from 'fastify'
import {
  loginSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/reward-partner.swagger-schema'
import type RewardPartnerHandler from '../handlers/reward-partner.handler'

class RewardPartnerRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: RewardPartnerHandler
  ) {}

  setupRoutes(): void {
    // Rutas estáticas primero
    // Rutas estáticas primero
    this.server.post('/api/reward-partner/auth/login', { schema: loginSwaggerSchema }, async (req, rep) => {
      await this.handler.login(req, rep)
    })
    this.server.get('/api/reward-partner/auth/refresh-token', {
      preHandler: this.server.auth([this.server.validateRefreshToken]),
      handler: async (req, rep) => {
        await this.handler.refreshToken(req, rep)
      }
    })
    this.server.get('/api/reward-partner/auth/validate-role', {
      preHandler: this.server.auth([this.server.getTokenRole]),
      handler: async (req, rep) => {
        await this.handler.validateRole(req, rep)
      }
    })
    this.server.get('/api/reward-partner', {
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    })
    this.server.post('/api/reward-partner', { schema: registerSwaggerSchema }, async (req, rep) => {
      await this.handler.register(req, rep)
    })

    // Rutas con parámetros dinámicos después
    this.server.get('/api/reward-partner/:id', async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
      await this.handler.findById(req, rep)
    })
    this.server.put('/api/reward-partner/:id', {
      schema: updateSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.update(req, rep)
      }
    })
    this.server.delete('/api/reward-partner/:id', {
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.delete(req, rep)
      }
    })
  }
}

export default RewardPartnerRoute
