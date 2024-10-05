import { type FastifyInstance, type FastifyRequest } from 'fastify'
import { registerSwaggerSchema, updateSwaggerSchema } from '../swagger-schema/reward-partner.swagger-schema'
import type RewardPartnerHandler from '../handler/reward-partner.handler'

class RewardPartnerRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: RewardPartnerHandler
  ) {}

  setupRoutes(): void {
    this.router.post('/api/reward-partner', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.register(req, res)
    })
    this.router.put(
      '/api/reward-partner/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.update(req, res)
      }
    )
    this.router.post('/api/reward-partner/auth/login', async (req, res) => {
      await this.handler.login(req, res)
    })
    this.router.post('/api/reward-partner/auth/refresh-token', {
      preHandler: this.router.auth([this.router.validateRefreshToken]),
      handler: async (req, res) => {
        await this.handler.refreshToken(req, res)
      }
    })
  }
}

export default RewardPartnerRoute
