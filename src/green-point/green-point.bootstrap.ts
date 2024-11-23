import { type FastifyInstance } from 'fastify'
import type EntityRepository from '../entity/domain/repositories/entity.repository'
import EntityMikroORMRepository from '../entity/infrastructure/repositories/mikro-orm/entity.mikroorm.repository'
import type GreenPointRepository from './domain/repositories/green-point.repository'
import GreenPointHandler from './infrastructure/handlers/green-point.handler'
import GreenPointMikroORMRepository from './infrastructure/repositories/mikro-orm/green-point.mikroorm.repository'
import GreenPointRoute from './infrastructure/routes/green-point.route'

async function bootstrapGreenPoint(server: FastifyInstance): Promise<void> {
  const greenPointRepository: GreenPointRepository = new GreenPointMikroORMRepository()
  const entityRepository: EntityRepository = new EntityMikroORMRepository()

  const handler = new GreenPointHandler(greenPointRepository, entityRepository)

  const greenPointRoute = new GreenPointRoute(server, handler)
  greenPointRoute.setupRoutes()
}

export default bootstrapGreenPoint
