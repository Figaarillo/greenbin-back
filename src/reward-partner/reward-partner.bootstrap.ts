import { type FastifyInstance } from 'fastify'
import type IJWTStrategy from '../auth/domain/strategies/jwt.interface.strategy'
import JWTStrategy from '../auth/infrastructure/strategies/basic-jwt.strategy'
import type RewardPartnerRepository from './domain/repositories/reward-partner.repository'
import RewardPartnerHandler from './infrastructure/handlers/reward-partner.handler'
import RewardPartnerMikroORMRepository from './infrastructure/repositories/mikro-orm/reward-partner.mikroorm.repository'
import RewardPartnerRoute from './infrastructure/routes/reward-partner.route'
import type EntityRepository from '../entity/domain/repositories/entity.repository'
import EntityMikroORMRepository from '../entity/infrastructure/repositories/mikro-orm/entity.mikroorm.repository'

async function bootstrapRewardPartner(router: FastifyInstance): Promise<void> {
  const rewardPartnerRepository: RewardPartnerRepository = new RewardPartnerMikroORMRepository()
  const entityRepository: EntityRepository = new EntityMikroORMRepository()
  const jwtStrategy: IJWTStrategy = new JWTStrategy()

  const handler = new RewardPartnerHandler(rewardPartnerRepository, entityRepository, jwtStrategy)

  const routes = new RewardPartnerRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapRewardPartner
