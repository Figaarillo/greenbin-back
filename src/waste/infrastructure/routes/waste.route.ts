import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteHandler from '../handlers/waste.handler'

class WasteRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/waste/:id', async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
      await this.handler.findByID(req, rep)
    })
    this.server.post('/api/waste', async (req, rep) => {
      await this.handler.register(req, rep)
    })
  }
}

export default WasteRoute
