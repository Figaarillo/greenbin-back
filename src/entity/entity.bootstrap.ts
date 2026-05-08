import { type FastifyInstance } from 'fastify'
import type EntityRepository from './domain/repositories/entity.repository'
import EntityHandler from './infrastructure/handlers/entity.handler'
import EntityMikroORMRepository from './infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import EntityRoute from './infrastructure/routes/entity.route'
import type IJWTStrategy from '../auth/domain/strategies/jwt.interface.strategy'
import JWTStrategy from '../auth/infrastructure/strategies/basic-jwt.strategy'

async function bootstrapEntity(router: FastifyInstance): Promise<void> {
  const repository: EntityRepository = new EntityMikroORMRepository()
  const jwtStrategy: IJWTStrategy = new JWTStrategy()

  const handler = new EntityHandler(repository, jwtStrategy)

  const entityRoute = new EntityRoute(router, handler)
  entityRoute.setupRoutes()
}

export default bootstrapEntity
