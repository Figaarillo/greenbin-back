import { type FastifyReply, type FastifyInstance, type FastifyRequest } from 'fastify'
import type NeighborHandler from '../handler/neighbor.handler'
import { registerSwaggerSchema, updateSwaggerSchema } from '../swagger-schema/neighbor.swagger-schema'

class NeighborRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: NeighborHandler
  ) {}

  setupRoutes(): void {
    this.router.post('/api/neighbor/auth/login', async (req, rep) => {
      await this.handler.login(req, rep)
    })
    this.router.get('/api/neighbor/auth/refresh-token', {
      preHandler: this.router.auth([this.router.validateRefreshToken]),
      handler: async (req: FastifyRequest, res: FastifyReply) => {
        await this.handler.refreshToken(req, res)
      }
    })
    this.router.post('/api/neighbor', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.register(req, res)
    })
    this.router.put(
      '/api/neighbor/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.update(req, res)
      }
    )
  }
}

export default NeighborRoute
