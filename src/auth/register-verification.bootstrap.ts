import { type FastifyInstance } from 'fastify'
import NeighborMikroORMRepository from '../neighbor/infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import RewardPartnerMikroORMRepository from '../reward-partner/infrastructure/repositories/mikro-orm/reward-partner.mikroorm.repository'
import RegisterVerificationHandler from './infrastructure/handlers/register-verification.handler'
import RegisterVerificationRoute from './infrastructure/routes/register-verification.route'

function bootstrapRegisterVerification(app: FastifyInstance): void {
  const neighborRepository = new NeighborMikroORMRepository()
  const rewardPartnerRepository = new RewardPartnerMikroORMRepository()

  const handler = new RegisterVerificationHandler(neighborRepository, rewardPartnerRepository)

  const routes = new RegisterVerificationRoute(app, handler)
  routes.setupRoutes()
}

export default bootstrapRegisterVerification
