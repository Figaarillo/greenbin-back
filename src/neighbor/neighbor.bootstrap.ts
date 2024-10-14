import { type FastifyInstance } from 'fastify'
import type IJWTProvider from '../auth/domain/providers/jwt.interface.provider'
import JWTProvider from '../auth/infrastructure/provider/jwt.provider'
import { type Services } from '../db'
import type NeighborRepository from './domain/repositories/neighbor.repository'
import NeighborHandler from './infrastructure/handlers/neighbor.handler'
import NeighborMikroORMRepository from './infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import NeighborRoute from './infrastructure/routes/neighbor.route'

async function bootstrapNeighbor(router: FastifyInstance, db: Services): Promise<void> {
  const repository: NeighborRepository = new NeighborMikroORMRepository(db)
  const provider: IJWTProvider = new JWTProvider()

  const handler = new NeighborHandler(repository, provider)

  const routes = new NeighborRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapNeighbor
