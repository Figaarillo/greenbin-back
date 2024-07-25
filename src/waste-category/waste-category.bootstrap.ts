import { type FastifyInstance } from 'fastify'
import { type Services } from '../db'
import type WasteCategoryRepository from './domain/repositories/waste-category.repository'
import WasteCategoryHandler from './infrastructure/handler/waste-category.handler'
import CategoryMikroORMRepository from './infrastructure/repositories/mikro-orm/waste-category.mikroorm.repository'
import WasteCategoryRoute from './infrastructure/routes/waste-category.route'

async function bootstrapCategory(router: FastifyInstance, db: Services): Promise<void> {
  const repository: WasteCategoryRepository = new CategoryMikroORMRepository(db)

  const handler = new WasteCategoryHandler(repository)

  const routes = new WasteCategoryRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapCategory
