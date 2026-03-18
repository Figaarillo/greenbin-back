import { type FastifyInstance } from 'fastify'
import type CouponRepository from '../coupon/domain/repositories/coupon.repository'
import CouponMikroORMRepository from '../coupon/infrastructure/repositories/mikro-orm/coupon.mikroorm.repository'
import type NeighborRepository from '../neighbor/domain/repositories/neighbor.repository'
import NeighborMikroORMRepository from '../neighbor/infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import type RewardPartnerRepository from '../reward-partner/domain/repositories/reward-partner.repository'
import RewardPartnerMikroORMRepository from '../reward-partner/infrastructure/repositories/mikro-orm/reward-partner.mikroorm.repository'
import type CouponTransactionRepository from './domain/repositories/coupon-transaction.repository'
import CouponTransactionHandler from './infrastructure/handlers/coupon-transaction.handler'
import CouponTransactionMikroORMRepository from './infrastructure/repositories/mikro-orm/coupon-transaction.mikroorm.repository'
import CouponTransactionRoute from './infrastructure/routes/coupon-transaction.route'

async function bootstrapCouponTransaction(router: FastifyInstance): Promise<void> {
  const couponTransactionRepository: CouponTransactionRepository = new CouponTransactionMikroORMRepository()
  const couponRepository: CouponRepository = new CouponMikroORMRepository()
  const neighborRepository: NeighborRepository = new NeighborMikroORMRepository()
  const rewardPartnerRepository: RewardPartnerRepository = new RewardPartnerMikroORMRepository()

  const handler = new CouponTransactionHandler(
    couponTransactionRepository,
    couponRepository,
    neighborRepository,
    rewardPartnerRepository
  )

  const routes = new CouponTransactionRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapCouponTransaction
