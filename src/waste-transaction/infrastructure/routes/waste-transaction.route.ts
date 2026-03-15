import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteTransactionHandler from '../handlers/waste-transaction.handler'
import type WasteDeliveryPayload from '../../domain/payloads/waste-delivery.payload'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'

class WasteTransactionRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteTransactionHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/waste/transaction/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.findByID(req, res)
    })
    this.server.post('/api/waste/transaction', async (req: FastifyRequest<{ Body: WasteTransactionPayload }>, res) => {
      await this.handler.register(req, res)
    })
    this.server.post(
      '/api/waste/transaction/delivery',
      async (req: FastifyRequest<{ Body: WasteDeliveryPayload }>, res) => {
        await this.handler.registerWasteDelivery(req, res)
      }
    )
  }
}

export default WasteTransactionRoute
