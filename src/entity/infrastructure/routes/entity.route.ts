import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type EntityHandler from '../handler/entity.handler'

class EntityRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: EntityHandler
  ) {}

  setupRoutes(): void {
    this.router.get('/api/entity', async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
      await this.handler.List(req, res)
    })
    this.router.get('/api/entity/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.FindByID(req, res)
    })
    this.router.post('/api/entity', async (req, res) => {
      await this.handler.Register(req, res)
    })
    this.router.put('/api/entity/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.Update(req, res)
    })
    this.router.delete('/api/entity/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.Delete(req, res)
    })
  }
}

export default EntityRoute
