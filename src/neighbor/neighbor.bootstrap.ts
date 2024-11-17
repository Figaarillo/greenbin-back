import { type FastifyInstance } from 'fastify'
import type IJWTProvider from '../auth/domain/providers/jwt.interface.provider'
import JWTProvider from '../auth/infrastructure/provider/jwt.provider'
import type NeighborRepository from './domain/repositories/neighbor.repository'
import NeighborHandler from './infrastructure/handlers/neighbor.handler'
import NeighborMikroORMRepository from './infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import NeighborRoute from './infrastructure/routes/neighbor.route'
import EntityMikroORMRepository from '../entity/infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import type EntityRepository from '../entity/domain/repositories/entity.repository'

async function bootstrapNeighbor(router: FastifyInstance): Promise<void> {
  const neighborRepository: NeighborRepository = new NeighborMikroORMRepository()
  const entityRepository: EntityRepository = new EntityMikroORMRepository()
  const jwtProvider: IJWTProvider = new JWTProvider()

  const handler = new NeighborHandler(neighborRepository, entityRepository, jwtProvider)

  const routes = new NeighborRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapNeighbor
