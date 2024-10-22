import { type FastifyInstance, type FastifyRequest } from 'fastify'
import { registerSwaggerSchema, updateSwaggerSchema } from '../swagger-schemas/reward-partner.swagger-schema'
import type RewardPartnerHandler from '../handlers/reward-partner.handler'

class RewardPartnerRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: RewardPartnerHandler
  ) {}

  setupRoutes(): void {
    this.server.post('/api/reward-partner', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.register(req, res)
    })
    this.server.put('/api/reward-partner/:id', {
      schema: updateSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.update(req, res)
      }
    })
    this.server.post('/api/reward-partner/auth/login', async (req, res) => {
      await this.handler.login(req, res)
    })
    this.server.get('/api/reward-partner/auth/refresh-token', {
      preHandler: this.server.auth([this.server.validateRefreshToken]),
      handler: async (req, res) => {
        await this.handler.refreshToken(req, res)
      }
    })
    this.server.get('/api/reward-partner/auth/validate-role', {
      preHandler: this.server.auth([this.server.getTokenRole]),
      handler: async (req, res) => {
        await this.handler.validateRole(req, res)
      }
    })
  }
}

export default RewardPartnerRoute
