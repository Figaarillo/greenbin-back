import { type FastifyInstance } from 'fastify'
import EntityMikroORMRepository from '../entity/infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import NeighborMikroORMRepository from '../neighbor/infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import ResponsibleMikroORMRepository from '../responsible/infrastructure/repositories/mikro-orm/responsible.mikroorm.repository'
import RewardPartnerMikroORMRepository from '../reward-partner/infrastructure/repositories/mikro-orm/reward-partner.mikroorm.repository'
import PasswordResetHandler from './infrastructure/handlers/password-reset.handler'
import PasswordResetRoute from './infrastructure/routes/password-reset.route'

function bootstrapPasswordReset(app: FastifyInstance): void {
  const entityRepository = new EntityMikroORMRepository()
  const neighborRepository = new NeighborMikroORMRepository()
  const responsibleRepository = new ResponsibleMikroORMRepository()
  const rewardPartnerRepository = new RewardPartnerMikroORMRepository()

  const handler = new PasswordResetHandler(
    entityRepository,
    neighborRepository,
    responsibleRepository,
    rewardPartnerRepository
  )

  const routes = new PasswordResetRoute(app, handler)
  routes.setupRoutes()
}

export default bootstrapPasswordReset
