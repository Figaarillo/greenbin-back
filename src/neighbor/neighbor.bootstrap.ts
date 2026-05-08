import { type FastifyInstance } from 'fastify'
import type IJWTStrategy from '../auth/domain/strategies/jwt.interface.strategy'
import JWTStrategy from '../auth/infrastructure/strategies/basic-jwt.strategy'
import type NeighborRepository from './domain/repositories/neighbor.repository'
import NeighborHandler from './infrastructure/handlers/neighbor.handler'
import NeighborMikroORMRepository from './infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import NeighborRoute from './infrastructure/routes/neighbor.route'
import EntityMikroORMRepository from '../entity/infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import type EntityRepository from '../entity/domain/repositories/entity.repository'

async function bootstrapNeighbor(router: FastifyInstance): Promise<void> {
  const neighborRepository: NeighborRepository = new NeighborMikroORMRepository()
  const entityRepository: EntityRepository = new EntityMikroORMRepository()
  const jwtStrategy: IJWTStrategy = new JWTStrategy()

  const handler = new NeighborHandler(neighborRepository, entityRepository, jwtStrategy)

  const routes = new NeighborRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapNeighbor
