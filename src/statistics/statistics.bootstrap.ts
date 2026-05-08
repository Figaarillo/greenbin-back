import { type FastifyInstance } from 'fastify'
import type StatisticsRepository from './domain/repositories/statistics.repository'
import StatisticsHandler from './infrastructure/handlers/statistics.handler'
import StatisticsMikroORMRepository from './infrastructure/repositories/mikro-orm/statistics.mikroorm.repository'
import StatisticsRoute from './infrastructure/routes/statistics.route'

async function bootstrapStatistics(router: FastifyInstance): Promise<void> {
  const repository: StatisticsRepository = new StatisticsMikroORMRepository()
  const handler = new StatisticsHandler(repository)
  const routes = new StatisticsRoute(router, handler)
  routes.setupRoutes()
}

export default bootstrapStatistics
