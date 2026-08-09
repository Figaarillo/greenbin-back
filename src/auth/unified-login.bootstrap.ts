import { type FastifyInstance } from 'fastify'
import NeighborMikroORMRepository from '../neighbor/infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import RewardPartnerMikroORMRepository from '../reward-partner/infrastructure/repositories/mikro-orm/reward-partner.mikroorm.repository'
import ResponsibleMikroORMRepository from '../responsible/infrastructure/repositories/mikro-orm/responsible.mikroorm.repository'
import EntityMikroORMRepository from '../entity/infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import JWTStrategy from './infrastructure/strategies/basic-jwt.strategy'
import InMemoryThrottleStoreRepository from './infrastructure/repositories/in-memory-throttle-store.repository'
import AuthHandler from './infrastructure/handlers/auth.handler'
import AuthRoute from './infrastructure/routes/auth-login.route'

// Instantiated ONCE at boot (not per-request), so the in-memory throttle store's Map
// persists lockout state across requests for the lifetime of this process. See
// design.md (Rate-limit / lockout) — a multi-instance deploy would need a shared
// (e.g. Redis) ThrottleStore implementation instead.
function bootstrapUnifiedLogin(app: FastifyInstance): void {
  const neighborRepository = new NeighborMikroORMRepository()
  const rewardPartnerRepository = new RewardPartnerMikroORMRepository()
  const responsibleRepository = new ResponsibleMikroORMRepository()
  const entityRepository = new EntityMikroORMRepository()
  const jwtStrategy = new JWTStrategy()
  const throttleStore = new InMemoryThrottleStoreRepository()

  const handler = new AuthHandler(
    neighborRepository,
    rewardPartnerRepository,
    responsibleRepository,
    entityRepository,
    jwtStrategy,
    throttleStore
  )

  const routes = new AuthRoute(app, handler)
  routes.setupRoutes()
}

export default bootstrapUnifiedLogin
