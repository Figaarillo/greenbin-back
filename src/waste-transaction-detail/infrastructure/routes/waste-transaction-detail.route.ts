import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteTransactionDetailHandler from '../handlers/waste-transaction-detail.handler'

class WasteTransactionDetailRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteTransactionDetailHandler
  ) {}

  setupRoutes(): void {
    this.server.get(
      '/api/waste/transaction-detail/:id',
      async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    )
    this.server.post('/api/waste/transaction-detail', async (req, rep) => {
      await this.handler.register(req, rep)
    })
  }
}

export default WasteTransactionDetailRoute
