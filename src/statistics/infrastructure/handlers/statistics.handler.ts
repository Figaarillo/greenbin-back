import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getURLParams } from '../../../shared/utils/http.request.util'
import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import GetTotalRecycledUseCase from '../../application/usecases/get-total-recycled.usecase'
import GetGreenPointsRankingUseCase from '../../application/usecases/get-green-points-ranking.usecase'
import GetWasteByCategoryUseCase from '../../application/usecases/get-waste-by-category.usecase'
import GetWasteByPeriodUseCase from '../../application/usecases/get-waste-by-period.usecase'
import GetNeighborDeliveriesUseCase from '../../application/usecases/get-neighbor-deliveries.usecase'

class StatisticsHandler {
  constructor(private readonly repository: StatisticsRepository) {}

  async getTotalRecycled(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to } = req.query
    const useCase = new GetTotalRecycledUseCase(this.repository)
    const result = await useCase.exec(
      entityId,
      from != null ? new Date(from) : undefined,
      to != null ? new Date(to) : undefined
    )
    HandleHTTPResponse.OK(rep, 'Total recycled retrieved successfully', result)
  }

  async getGreenPointsRanking(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to } = req.query
    const useCase = new GetGreenPointsRankingUseCase(this.repository)
    const result = await useCase.exec(
      entityId,
      from != null ? new Date(from) : undefined,
      to != null ? new Date(to) : undefined
    )
    HandleHTTPResponse.OK(rep, 'Green points ranking retrieved successfully', result)
  }

  async getWasteByCategory(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to } = req.query
    const useCase = new GetWasteByCategoryUseCase(this.repository)
    const result = await useCase.exec(
      entityId,
      from != null ? new Date(from) : undefined,
      to != null ? new Date(to) : undefined
    )
    HandleHTTPResponse.OK(rep, 'Waste by category retrieved successfully', result)
  }

  async getWasteByPeriod(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to, groupBy } = req.query
    const useCase = new GetWasteByPeriodUseCase(this.repository)
    const result = await useCase.exec(
      entityId,
      groupBy ?? 'month',
      from != null ? new Date(from) : undefined,
      to != null ? new Date(to) : undefined
    )
    HandleHTTPResponse.OK(rep, 'Waste by period retrieved successfully', result)
  }

  async getNeighborDeliveries(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const neighborId = getURLParams(req, 'neighborId')
    const { from, to } = req.query
    const useCase = new GetNeighborDeliveriesUseCase(this.repository)
    const result = await useCase.exec(
      neighborId,
      from != null ? new Date(from) : undefined,
      to != null ? new Date(to) : undefined
    )
    HandleHTTPResponse.OK(rep, 'Neighbor deliveries retrieved successfully', result)
  }
}

export default StatisticsHandler
