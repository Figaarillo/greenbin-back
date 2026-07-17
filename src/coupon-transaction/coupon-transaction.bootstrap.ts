import { type FastifyInstance } from 'fastify'
import type CouponRepository from '../coupon/domain/repositories/coupon.repository'
import CouponMikroORMRepository from '../coupon/infrastructure/repositories/mikro-orm/coupon.mikroorm.repository'
import type NeighborRepository from '../neighbor/domain/repositories/neighbor.repository'
import NeighborMikroORMRepository from '../neighbor/infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import type RewardPartnerRepository from '../reward-partner/domain/repositories/reward-partner.repository'
import RewardPartnerMikroORMRepository from '../reward-partner/infrastructure/repositories/mikro-orm/reward-partner.mikroorm.repository'
import createNotificationDispatcher from '../notification/notification-dispatcher.factory'
import type CouponTransactionRepository from './domain/repositories/coupon-transaction.repository'
import CouponTransactionHandler from './infrastructure/handlers/coupon-transaction.handler'
import CouponTransactionMikroORMRepository from './infrastructure/repositories/mikro-orm/coupon-transaction.mikroorm.repository'
import CouponTransactionRoute from './infrastructure/routes/coupon-transaction.route'
import NotifyExpiringCouponsUseCase from './application/usecases/notify-expiring-coupons.usecase'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

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

  scheduleExpiringCouponsJob(router, couponTransactionRepository)
}

// No hay ninguna lib de cron en el proyecto todavía (ver package.json): para
// un job diario simple, un setInterval alcanza y no agrega una dependencia
// nueva solo para esto. Si en el futuro se suman más jobs programados, ahí
// sí vale la pena migrar a un runner de cron compartido (ver propuesta 11).
function scheduleExpiringCouponsJob(router: FastifyInstance, repository: CouponTransactionRepository): void {
  const useCase = new NotifyExpiringCouponsUseCase(repository, createNotificationDispatcher())

  const run = (): void => {
    useCase.exec().catch(error => {
      router.log.error({ error }, '[NotifyExpiringCouponsUseCase] falló la corrida diaria')
    })
  }

  // Corre una vez al bootear además de cada 24hs: es idempotente
  // (expirationNotifiedAt evita duplicados) así que no hay riesgo de spam
  // por los restarts frecuentes de nodemon en dev, y evita esperar hasta 24hs
  // para la primera corrida después de un deploy.
  run()
  const timer = setInterval(run, ONE_DAY_MS)
  router.addHook('onClose', async () => {
    clearInterval(timer)
  })
}

export default bootstrapCouponTransaction
