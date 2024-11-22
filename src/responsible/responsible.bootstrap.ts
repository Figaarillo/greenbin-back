import { type FastifyInstance } from 'fastify'
import type IJWTStrategy from '../auth/domain/strategies/jwt.interface.strategy'
import JWTStrategy from '../auth/infrastructure/strategies/basic-jwt.strategy'
import type EntityRepository from '../entity/domain/repositories/entity.repository'
import EntityMikroORMRepository from '../entity/infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import type ResponsibleRepository from './domain/repositories/responsible.repository'
import ResponsibleHandler from './infrastructure/handlers/responsible.handler'
import ResponsibleMikroORMRepository from './infrastructure/repositories/mikro-orm/responsible.mikroorm.repository'
import ResponsibleRoute from './infrastructure/routes/responsible.route'

async function bootstrapResponsible(router: FastifyInstance): Promise<void> {
  const responsibleRepository: ResponsibleRepository = new ResponsibleMikroORMRepository()
  const entityRepository: EntityRepository = new EntityMikroORMRepository()
  const jwtStrategy: IJWTStrategy = new JWTStrategy()

  const handler = new ResponsibleHandler(responsibleRepository, entityRepository, jwtStrategy)

  const routes = new ResponsibleRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapResponsible
