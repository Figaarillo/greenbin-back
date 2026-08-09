import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type CouponTransactionHandler from '../handlers/coupon-transaction.handler'
import type RedeemCouponPayload from '../../domain/payloads/redeem-coupon.payload'
import type UseCouponPayload from '../../domain/payloads/use-coupon.payload'
import { Roles } from '../../../auth/domain/entities/role'

class CouponTransactionRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: CouponTransactionHandler
  ) {}

  setupRoutes(): void {
    this.server.post('/api/redeem-coupon', {
      preHandler: this.server.protect(Roles.NEIGHBOR),
      handler: async (req: FastifyRequest<{ Body: RedeemCouponPayload }>, rep) => {
        await this.handler.redeemCoupon(req, rep)
      }
    })
    this.server.post('/api/coupon-transaction/use', {
      preHandler: this.server.protect(Roles.NEIGHBOR, Roles.REWARD_PARTNER),
      handler: async (req: FastifyRequest<{ Body: UseCouponPayload }>, rep) => {
        await this.handler.useCoupon(req, rep)
      }
    })
    // El catálogo del vecino ya viene resuelto contra la regla de canje: cada
    // cupón trae `redeemable` y, si no lo es, el motivo listo para mostrar.
    this.server.get('/api/coupon-transaction/catalog/:neighborId', {
      preHandler: this.server.protect(Roles.NEIGHBOR),
      handler: async (
        req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
        rep
      ) => {
        await this.handler.listNeighborCatalog(req, rep)
      }
    })
    this.server.get('/api/coupon-transaction/neighbor/:neighborId', {
      preHandler: this.server.protect(Roles.NEIGHBOR, Roles.ENTITY, Roles.RESPONSIBLE),
      handler: async (
        req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
        rep
      ) => {
        await this.handler.listByNeighbor(req, rep)
      }
    })
    this.server.get('/api/coupon-transaction/reward-partner/:rewardPartnerId', {
      preHandler: this.server.protect(Roles.REWARD_PARTNER, Roles.ENTITY, Roles.RESPONSIBLE),
      handler: async (
        req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
        rep
      ) => {
        await this.handler.listByRewardPartner(req, rep)
      }
    })
    this.server.get('/api/coupon-transaction/reward-partner/:rewardPartnerId/stats', {
      preHandler: this.server.protect(Roles.REWARD_PARTNER, Roles.ENTITY, Roles.RESPONSIBLE),
      handler: async (
        req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
        rep
      ) => {
        await this.handler.getRewardPartnerStats(req, rep)
      }
    })
    this.server.get('/api/coupon-transaction/:id', {
      preHandler: this.server.protect(Roles.NEIGHBOR, Roles.ENTITY, Roles.RESPONSIBLE, Roles.REWARD_PARTNER),
      handler: async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    })
  }
}

export default CouponTransactionRoute
