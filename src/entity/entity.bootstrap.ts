import { type FastifyInstance } from 'fastify'
import { type Services } from 'src/db'
import type EntityRepository from './domain/repositories/entity.repository'
import EntityHandler from './infrastructure/handler/entity.handler'
import EntityTypeormRepository from './infrastructure/repositories/typeorm/entity.typeorm.repository'
import EntityRoute from './infrastructure/routes/entity.route'
import EntityMikroORMRepository from './infrastructure/repositories/mikro-orm/entity.mikroorm.repository'

async function bootstrapEntity(router: FastifyInstance, db: Services): Promise<void> {
  const repository: EntityRepository = new EntityMikroORMRepository(db)

  const handler = new EntityHandler(repository)

  const entityRoute = new EntityRoute(router, handler)
  entityRoute.setupRoutes()
}

export default bootstrapEntity
