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
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.findByID(req, res)
      }
    )
    this.server.post('/api/waste/transaction-detail', async (req, res) => {
      await this.handler.register(req, res)
    })
  }
}

export default WasteTransactionDetailRoute
