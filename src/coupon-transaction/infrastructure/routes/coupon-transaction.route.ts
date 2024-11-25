import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type CouponTransactionHandler from '../handlers/coupon-transaction.handler'
import type RedeemCouponPayload from '../../domain/payloads/redeem-coupon.payload'

class CouponTransactionRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: CouponTransactionHandler
  ) {}

  setupRoutes(): void {
    this.server.post('/api/redeem-coupon', async (req: FastifyRequest<{ Body: RedeemCouponPayload }>, res) => {
      await this.handler.redeemCoupon(req, res)
    })
    this.server.get(
      '/api/coupon-transaction/:id',
      async (req: FastifyRequest<{ Params: Record<string, string> }>, res) => {
        await this.handler.findByID(req, res)
      }
    )
  }
}

export default CouponTransactionRoute
