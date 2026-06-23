import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteTransactionHandler from '../handlers/waste-transaction.handler'
import type WasteDeliveryPayload from '../../domain/payloads/waste-delivery.payload'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'
import { Roles } from '../../../auth/domain/entities/role'

class WasteTransactionRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteTransactionHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/waste/transaction/:id', {
      preHandler: this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE, Roles.NEIGHBOR),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    })
    this.server.get('/api/waste/transaction/neighbor/:neighborId', {
      preHandler: this.server.protect(Roles.NEIGHBOR, Roles.ENTITY, Roles.RESPONSIBLE),
      handler: async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
        await this.handler.listByNeighbor(req, rep)
      }
    })
    this.server.get('/api/waste/transaction/responsible/:responsibleId', {
      preHandler: this.server.protect(Roles.RESPONSIBLE, Roles.ENTITY),
      handler: async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
        await this.handler.listByResponsible(req, rep)
      }
    })
    this.server.post('/api/waste/transaction', {
      preHandler: this.server.protect(Roles.RESPONSIBLE, Roles.ENTITY),
      handler: async (req: FastifyRequest<{ Body: WasteTransactionPayload }>, rep) => {
        await this.handler.register(req, rep)
      }
    })
    this.server.post('/api/waste/transaction/delivery', {
      preHandler: this.server.protect(Roles.RESPONSIBLE, Roles.ENTITY),
      handler: async (req: FastifyRequest<{ Body: WasteDeliveryPayload }>, rep) => {
        await this.handler.registerWasteDelivery(req, rep)
      }
    })
  }
}

export default WasteTransactionRoute
