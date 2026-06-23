import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteTransactionDetailHandler from '../handlers/waste-transaction-detail.handler'
import { Roles } from '../../../auth/domain/entities/role'

class WasteTransactionDetailRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteTransactionDetailHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/waste/transaction-detail/:id', {
      preHandler: this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE, Roles.NEIGHBOR),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    })
    this.server.post('/api/waste/transaction-detail', {
      preHandler: this.server.protect(Roles.RESPONSIBLE, Roles.ENTITY),
      handler: async (req, rep) => {
        await this.handler.register(req, rep)
      }
    })
  }
}

export default WasteTransactionDetailRoute
