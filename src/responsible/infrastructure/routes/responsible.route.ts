import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type ResponsibleHandler from '../handler/responsible.handler'

class ResponsibleRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: ResponsibleHandler
  ) {}

  setupRoutes(): void {
    this.router.get('/api/responsible', async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
      await this.handler.List(req, res)
    })
    this.router.get('/api/responsible/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.FindByID(req, res)
    })
    this.router.post('/api/responsible', async (req, res) => {
      await this.handler.Register(req, res)
    })
    this.router.put('/api/responsible/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.Update(req, res)
    })
    this.router.delete('/api/responsible/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.Delete(req, res)
    })
  }
}

export default ResponsibleRoute
