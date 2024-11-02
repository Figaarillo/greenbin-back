import { type FastifyInstance } from 'fastify'
import type WasteRepository from './domain/repositories/waste.repository'
import WasteHandler from './infrastructure/handlers/waste.handler'
import WasteMikroORMRepository from './infrastructure/repositories/mikro-orm/waste.mikroorm.repository'
import WasteRoute from './infrastructure/routes/waste.route'

async function bootstrapWasteC(router: FastifyInstance): Promise<void> {
  const repository: WasteRepository = new WasteMikroORMRepository()

  const handler = new WasteHandler(repository)

  const routes = new WasteRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapWasteC
