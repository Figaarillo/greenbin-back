import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type CouponPayload from '../../domain/payloads/coupon.payload'
import type CouponHandler from '../handlers/coupon.handler'

class CouponRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: CouponHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/coupon', async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
      await this.handler.list(req, res)
    })
    this.server.get('/api/coupon/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.findByID(req, res)
    })
    this.server.post('/api/coupon', async (req: FastifyRequest<{ Body: CouponPayload }>, res) => {
      await this.handler.register(req, res)
    })
  }
}

export default CouponRoute
