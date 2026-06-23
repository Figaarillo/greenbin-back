import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteHandler from '../handlers/waste.handler'
import { Roles } from '../../../auth/domain/entities/role'

class WasteRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/waste/:id', {
      preHandler: this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE, Roles.NEIGHBOR),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    })
    this.server.post('/api/waste', {
      preHandler: this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE),
      handler: async (req, rep) => {
        await this.handler.register(req, rep)
      }
    })
  }
}

export default WasteRoute
