import { type FastifyInstance } from 'fastify'
import type WasteCategoryRepository from './domain/repositories/waste-category.repository'
import WasteCategoryHandler from './infrastructure/handlers/waste-category.handler'
import CategoryMikroORMRepository from './infrastructure/repositories/mikro-orm/waste-category.mikroorm.repository'
import WasteCategoryRoute from './infrastructure/routes/waste-category.route'

async function bootstrapWasteCategory(router: FastifyInstance): Promise<void> {
  const repository: WasteCategoryRepository = new CategoryMikroORMRepository()

  const handler = new WasteCategoryHandler(repository)

  const routes = new WasteCategoryRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapWasteCategory
