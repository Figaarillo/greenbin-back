import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteTransactionHandler from '../handlers/waste-transaction.handler'

class WasteTransactionRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteTransactionHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/waste-transaction/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.findByID(req, res)
    })
    this.server.post('/api/waste-transaction', async (req, res) => {
      await this.handler.register(req, res)
    })
  }
}

export default WasteTransactionRoute
