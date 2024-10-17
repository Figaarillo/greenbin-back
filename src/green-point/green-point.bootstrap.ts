import { type FastifyInstance } from 'fastify'
import type GreenPointRepository from './domain/repositories/green-point.repository'
import GreenPointHandler from './infrastructure/handlers/green-point.handler'
import GreenPointMikroORMRepository from './infrastructure/repositories/mikro-orm/green-point.mikroorm.repository'
import GreenPointRoute from './infrastructure/routes/green-point.route'

async function bootstrapGreenPoint(server: FastifyInstance): Promise<void> {
  const repository: GreenPointRepository = new GreenPointMikroORMRepository()

  const handler = new GreenPointHandler(repository)

  const greenPointRoute = new GreenPointRoute(server, handler)
  greenPointRoute.setupRoutes()
}

export default bootstrapGreenPoint
