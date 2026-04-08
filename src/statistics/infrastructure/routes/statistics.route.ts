import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type StatisticsHandler from '../handlers/statistics.handler'

class StatisticsRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: StatisticsHandler
  ) {}

  setupRoutes(): void {
    this.server.get(
      '/api/statistics/entity/:entityId/total-recycled',
      async (req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>, rep) => {
        await this.handler.getTotalRecycled(req, rep)
      }
    )

    this.server.get(
      '/api/statistics/entity/:entityId/green-points-ranking',
      async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
        await this.handler.getGreenPointsRanking(req, rep)
      }
    )

    this.server.get(
      '/api/statistics/entity/:entityId/waste-by-category',
      async (req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>, rep) => {
        await this.handler.getWasteByCategory(req, rep)
      }
    )

    this.server.get(
      '/api/statistics/entity/:entityId/waste-by-period',
      async (req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>, rep) => {
        await this.handler.getWasteByPeriod(req, rep)
      }
    )

    this.server.get(
      '/api/statistics/neighbor/:neighborId/deliveries',
      async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
        await this.handler.getNeighborDeliveries(req, rep)
      }
    )
  }
}

export default StatisticsRoute
