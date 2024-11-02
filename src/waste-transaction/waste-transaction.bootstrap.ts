import { type FastifyInstance } from 'fastify'
import type WasteTransactionRepository from './domain/repositories/waste-transaction.repository'
import WasteTransactionHandler from './infrastructure/handlers/waste-transaction.handler'
import WasteTransactionMikroORMRepository from './infrastructure/repositories/mikro-orm/waste-transaction.mikroorm.repository'
import WasteTransactionRoute from './infrastructure/routes/waste-transaction.route'

async function bootstrapWasteTransaction(router: FastifyInstance): Promise<void> {
  const repository: WasteTransactionRepository = new WasteTransactionMikroORMRepository()

  const handler = new WasteTransactionHandler(repository)

  const routes = new WasteTransactionRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapWasteTransaction
