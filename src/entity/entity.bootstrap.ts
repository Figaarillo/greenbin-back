import { type FastifyInstance } from 'fastify'
import { type Services } from '../db'
import type EntityRepository from './domain/repositories/entity.repository'
import EntityHandler from './infrastructure/handlers/entity.handler'
import EntityMikroORMRepository from './infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import EntityRoute from './infrastructure/routes/entity.route'
import type IJWTProvider from '../auth/domain/providers/jwt.interface.provider'
import JWTProvider from '../auth/infrastructure/provider/jwt.provider'

async function bootstrapEntity(router: FastifyInstance, db: Services): Promise<void> {
  const repository: EntityRepository = new EntityMikroORMRepository(db)
  const jwtProvider: IJWTProvider = new JWTProvider()

  const handler = new EntityHandler(repository, jwtProvider)

  const entityRoute = new EntityRoute(router, handler)
  entityRoute.setupRoutes()
}

export default bootstrapEntity
