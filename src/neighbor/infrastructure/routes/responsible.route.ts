import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type NeighborHandler from '../handler/neighbor.handler'
import { registerSwaggerSchema, updateSwaggerSchema } from '../swagger-schema/neighbor.swagger-schema'

class NeighborRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: NeighborHandler
  ) {}

  setupRoutes(): void {
    this.router.post('/api/neighbor', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.Register(req, res)
    })
    this.router.put(
      '/api/neighbor/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.Update(req, res)
      }
    )
  }
}

export default NeighborRoute
