import { type FastifyInstance } from 'fastify'
import { type Services } from '../db'
import type ResponsibleRepository from './domain/repositories/responsible.repository'
import ResponsibleHandler from './infrastructure/handler/responsible.handler'
import ResponsibleMikroORMRepository from './infrastructure/repositories/mikro-orm/responsible.mikroorm.repository'
import ResponsibleRoute from './infrastructure/routes/responsible.route'
import type IJWTProvider from '../auth/domain/providers/jwt.interface.provider'
import JWTProvider from '../auth/infrastructure/provider/jwt.provider'

async function bootstrapResponsible(router: FastifyInstance, db: Services): Promise<void> {
  const repository: ResponsibleRepository = new ResponsibleMikroORMRepository(db)
  const jwtProvider: IJWTProvider = new JWTProvider()

  const handler = new ResponsibleHandler(repository, jwtProvider)

  const routes = new ResponsibleRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapResponsible
