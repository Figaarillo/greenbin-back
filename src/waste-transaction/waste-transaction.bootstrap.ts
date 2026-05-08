import { type FastifyInstance } from 'fastify'
import type NeighborRepository from '../neighbor/domain/repositories/neighbor.repository'
import NeighborMikroORMRepository from '../neighbor/infrastructure/repositories/mikro-orm/neighbor.mikroorm.repository'
import type WasteCategoryRepository from '../waste-category/domain/repositories/waste-category.repository'
import CategoryMikroORMRepository from '../waste-category/infrastructure/repositories/mikro-orm/waste-category.mikroorm.repository'
import type WasteTransactionDetailRepository from '../waste-transaction-detail/domain/repositories/waste-transaction-detail.repository'
import WasteTransactionDetailMikroORMRepository from '../waste-transaction-detail/infrastructure/repositories/mikro-orm/waste-transaction-detail.mikroorm.repository'
import type WasteRepository from '../waste/domain/repositories/waste.repository'
import WasteMikroORMRepository from '../waste/infrastructure/repositories/mikro-orm/waste.mikroorm.repository'
import type WasteTransactionRepository from './domain/repositories/waste-transaction.repository'
import WasteTransactionHandler from './infrastructure/handlers/waste-transaction.handler'
import WasteTransactionMikroORMRepository from './infrastructure/repositories/mikro-orm/waste-transaction.mikroorm.repository'
import WasteTransactionRoute from './infrastructure/routes/waste-transaction.route'

async function bootstrapWasteTransaction(router: FastifyInstance): Promise<void> {
  const transactionRepository: WasteTransactionRepository = new WasteTransactionMikroORMRepository()
  const transactionDetailRepository: WasteTransactionDetailRepository = new WasteTransactionDetailMikroORMRepository()
  const wasteRepository: WasteRepository = new WasteMikroORMRepository()
  const neighborRepository: NeighborRepository = new NeighborMikroORMRepository()
  const categoryRepository: WasteCategoryRepository = new CategoryMikroORMRepository()

  const handler = new WasteTransactionHandler(
    transactionDetailRepository,
    transactionRepository,
    wasteRepository,
    neighborRepository,
    categoryRepository
  )

  const routes = new WasteTransactionRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapWasteTransaction
