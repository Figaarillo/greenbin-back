import { type FastifyReply, type FastifyInstance, type FastifyRequest } from 'fastify'
import type NeighborHandler from '../handler/neighbor.handler'
import { registerSwaggerSchema, updateSwaggerSchema } from '../swagger-schema/neighbor.swagger-schema'

class NeighborRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: NeighborHandler
  ) {}

  setupRoutes(): void {
    this.router.get('/api/neighbor', async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
      await this.handler.list(req, rep)
    })
    this.router.get('/api/neighbor/:id', async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
      await this.handler.findById(req, rep)
    })
    this.router.post('/api/neighbor/auth/login', async (req, rep) => {
      await this.handler.login(req, rep)
    })
    this.router.get('/api/neighbor/auth/refresh-token', {
      preHandler: this.router.auth([this.router.validateRefreshToken]),
      handler: async (req: FastifyRequest, rep: FastifyReply) => {
        await this.handler.refreshToken(req, rep)
      }
    })
    this.router.post('/api/neighbor', { schema: registerSwaggerSchema }, async (req, rep) => {
      await this.handler.register(req, rep)
    })
    this.router.put(
      '/api/neighbor/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.update(req, rep)
      }
    )
    this.router.get('/api/neighbor/auth/validate-role', {
      preHandler: this.router.auth([this.router.getTokenRole]),
      handler: async (req, rep) => {
        await this.handler.validateRole(req, rep)
      }
    })
  }
}

export default NeighborRoute
