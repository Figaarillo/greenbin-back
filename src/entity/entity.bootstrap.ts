import { type FastifyInstance } from 'fastify'
import { type DataSource } from 'typeorm'
import type EntityRepository from './domain/repositories/entity.repository'
import EntityHandler from './infrastructure/handler/entity.handler'
import EntityTypeormRepository from './infrastructure/repositories/typeorm/entity.typeorm.repository'
import EntityRoute from './infrastructure/routes/entity.route'

async function BootstrapEntity(db: DataSource, router: FastifyInstance): Promise<void> {
  const repository: EntityRepository = new EntityTypeormRepository(db)

  const handler = new EntityHandler(repository)

  const entityRoute = new EntityRoute(router, handler)
  entityRoute.setupRoutes()
}

export default BootstrapEntity
