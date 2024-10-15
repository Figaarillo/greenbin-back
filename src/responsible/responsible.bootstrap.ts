import { type FastifyInstance } from 'fastify'
import type IJWTProvider from '../auth/domain/providers/jwt.interface.provider'
import JWTProvider from '../auth/infrastructure/provider/jwt.provider'
import type ResponsibleRepository from './domain/repositories/responsible.repository'
import ResponsibleHandler from './infrastructure/handlers/responsible.handler'
import ResponsibleMikroORMRepository from './infrastructure/repositories/mikro-orm/responsible.mikroorm.repository'
import ResponsibleRoute from './infrastructure/routes/responsible.route'

async function bootstrapResponsible(router: FastifyInstance): Promise<void> {
  const repository: ResponsibleRepository = new ResponsibleMikroORMRepository()
  const jwtProvider: IJWTProvider = new JWTProvider()

  const handler = new ResponsibleHandler(repository, jwtProvider)

  const routes = new ResponsibleRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapResponsible
