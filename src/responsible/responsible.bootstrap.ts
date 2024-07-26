import { type FastifyInstance } from 'fastify'
import { type Services } from '../db'
import type ResponsibleRepository from './domain/repositories/responsible.repository'
import ResponsibleHandler from './infrastructure/handler/responsible.handler'
import ResponsibleMikroORMRepository from './infrastructure/repositories/mikro-orm/responsible.mikroorm.repository'
import ResponsibleRoute from './infrastructure/routes/responsible.route'

async function bootstrapResponsible(router: FastifyInstance, db: Services): Promise<void> {
  const repository: ResponsibleRepository = new ResponsibleMikroORMRepository(db)

  const handler = new ResponsibleHandler(repository)

  const routes = new ResponsibleRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapResponsible
