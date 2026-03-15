import { type FastifyInstance } from 'fastify'
import type WasteTransactionRepository from '../waste-transaction/domain/repositories/waste-transaction.repository'
import WasteTransactionMikroORMRepository from '../waste-transaction/infrastructure/repositories/mikro-orm/waste-transaction.mikroorm.repository'
import type WasteRepository from '../waste/domain/repositories/waste.repository'
import WasteMikroORMRepository from '../waste/infrastructure/repositories/mikro-orm/waste.mikroorm.repository'
import type WasteTransactionDetailRepository from './domain/repositories/waste-transaction-detail.repository'
import WasteTransactionDetailHandler from './infrastructure/handlers/waste-transaction-detail.handler'
import WasteTransactionDetailMikroORMRepository from './infrastructure/repositories/mikro-orm/waste-transaction-detail.mikroorm.repository'
import WasteTransactionDetailRoute from './infrastructure/routes/waste-transaction-detail.route'

async function bootstrapWasteTransactionDetail(router: FastifyInstance): Promise<void> {
  const transctionDetailRepository: WasteTransactionDetailRepository = new WasteTransactionDetailMikroORMRepository()
  const transactionRepository: WasteTransactionRepository = new WasteTransactionMikroORMRepository()
  const wasteRepository: WasteRepository = new WasteMikroORMRepository()

  const handler = new WasteTransactionDetailHandler(transctionDetailRepository, transactionRepository, wasteRepository)

  const routes = new WasteTransactionDetailRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapWasteTransactionDetail
