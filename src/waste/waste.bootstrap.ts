import { type FastifyInstance } from 'fastify'
import type WasteCategoryRepository from '../waste-category/domain/repositories/waste-category.repository'
import CategoryMikroORMRepository from '../waste-category/infrastructure/repositories/mikro-orm/waste-category.mikroorm.repository'
import type WasteRepository from './domain/repositories/waste.repository'
import WasteHandler from './infrastructure/handlers/waste.handler'
import WasteMikroORMRepository from './infrastructure/repositories/mikro-orm/waste.mikroorm.repository'
import WasteRoute from './infrastructure/routes/waste.route'

async function bootstrapWaste(router: FastifyInstance): Promise<void> {
  const wasteRepository: WasteRepository = new WasteMikroORMRepository()
  const categoryRepository: WasteCategoryRepository = new CategoryMikroORMRepository()

  const handler = new WasteHandler(wasteRepository, categoryRepository)

  const routes = new WasteRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapWaste
