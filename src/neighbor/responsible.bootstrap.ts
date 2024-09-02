import { type FastifyInstance } from 'fastify'
import { type Services } from '../db'
import type NeighborRepository from './domain/repositories/neighbor.repository'
import NeighborHandler from './infrastructure/handler/neighbor.handler'
import NeighborMikroORMRepository from './infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import NeighborRoute from './infrastructure/routes/neighbor.route'

async function bootstrapNeighbor(router: FastifyInstance, db: Services): Promise<void> {
  const repository: NeighborRepository = new NeighborMikroORMRepository(db)

  const handler = new NeighborHandler(repository)

  const routes = new NeighborRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapNeighbor
