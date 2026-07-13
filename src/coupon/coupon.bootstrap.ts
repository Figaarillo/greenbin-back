import { type FastifyInstance } from 'fastify'
import type RewardPartnerRepository from '../reward-partner/domain/repositories/reward-partner.repository'
import RewardPartnerMikroORMRepository from '../reward-partner/infrastructure/repositories/mikro-orm/reward-partner.mikroorm.repository'
import type NeighborRepository from '../neighbor/domain/repositories/neighbor.repository'
import NeighborMikroORMRepository from '../neighbor/infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import type CouponRepository from './domain/repositories/coupon.repository'
import CouponHandler from './infrastructure/handlers/coupon.handler'
import CouponMikroORMRepository from './infrastructure/repositories/mikro-orm/coupon.mikroorm.repository'
import CouponRoute from './infrastructure/routes/coupon.route'

async function bootstrapCoupon(router: FastifyInstance): Promise<void> {
  const couponRepository: CouponRepository = new CouponMikroORMRepository()
  const rewardPartnerRepository: RewardPartnerRepository = new RewardPartnerMikroORMRepository()
  const neighborRepository: NeighborRepository = new NeighborMikroORMRepository()

  const handler = new CouponHandler(couponRepository, rewardPartnerRepository, neighborRepository)

  const routes = new CouponRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapCoupon
