import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type CouponTransactionHandler from '../handlers/coupon-transaction.handler'
import type RedeemCouponPayload from '../../domain/payloads/redeem-coupon.payload'

class CouponTransactionRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: CouponTransactionHandler
  ) {}

  setupRoutes(): void {
    this.server.post('/api/redeem-coupon', async (req: FastifyRequest<{ Body: RedeemCouponPayload }>, rep) => {
      await this.handler.redeemCoupon(req, rep)
    })
    this.server.get(
      '/api/coupon-transaction/:id',
      async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    )
    this.server.get(
      '/api/coupon-transaction/neighbor/:neighborId',
      async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
        await this.handler.listByNeighbor(req, rep)
      }
    )
  }
}

export default CouponTransactionRoute
