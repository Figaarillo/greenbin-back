import { type FastifyInstance } from 'fastify'
import type EntityHandler from '../handler/entity.handler'

class EntityRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: EntityHandler
  ) {}

  setupRoutes(): void {
    this.router.post('/api/entities', async (req, res) => {
      await this.handler.Register(req, res)
    })
  }
}

export default EntityRoute
