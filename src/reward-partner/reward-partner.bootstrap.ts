import { type FastifyInstance } from 'fastify'
import type IJWTProvider from '../auth/domain/providers/jwt.interface.provider'
import JWTProvider from '../auth/infrastructure/provider/jwt.provider'
import type RewardPartnerRepository from './domain/repositories/reward-partner.repository'
import RewardPartnerHandler from './infrastructure/handlers/reward-partner.handler'
import RewardPartnerMikroORMRepository from './infrastructure/repositories/mikro-orm/reward-partner.mikroorm.repository'
import RewardPartnerRoute from './infrastructure/routes/reward-partner.route'

async function bootstrapRewardPartner(router: FastifyInstance): Promise<void> {
  const repository: RewardPartnerRepository = new RewardPartnerMikroORMRepository()
  const jwtProvider: IJWTProvider = new JWTProvider()

  const handler = new RewardPartnerHandler(repository, jwtProvider)

  const routes = new RewardPartnerRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapRewardPartner
