import { type FastifyInstance } from 'fastify'
import type WasteTransactionDetailRepository from './domain/repositories/waste-transaction-detail.repository'
import WasteTransactionDetailHandler from './infrastructure/handlers/waste-transaction-detail.handler'
import WasteTransactionDetailMikroORMRepository from './infrastructure/repositories/mikro-orm/waste-transaction-detail.mikroorm.repository'
import WasteTransactionDetailRoute from './infrastructure/routes/waste-transaction-detail.route'

async function bootstrapWasteTransactionDetail(router: FastifyInstance): Promise<void> {
  const repository: WasteTransactionDetailRepository = new WasteTransactionDetailMikroORMRepository()

  const handler = new WasteTransactionDetailHandler(repository)

  const routes = new WasteTransactionDetailRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapWasteTransactionDetail
