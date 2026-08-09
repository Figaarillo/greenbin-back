import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getURLParams } from '../../../shared/utils/http.request.util'
import { parseRangeStart, parseRangeEnd } from '../../../shared/utils/date-range.util'
import type StatisticsRepository from '../../domain/repositories/statistics.repository'
import GetTotalRecycledUseCase from '../../application/usecases/get-total-recycled.usecase'
import GetGreenPointsRankingUseCase from '../../application/usecases/get-green-points-ranking.usecase'
import GetEntityCountsUseCase from '../../application/usecases/get-entity-counts.usecase'
import GetRewardPartnersRankingUseCase from '../../application/usecases/get-reward-partners-ranking.usecase'
import GetCo2AvoidedUseCase from '../../application/usecases/get-co2-avoided.usecase'
import GetPointsBalanceUseCase from '../../application/usecases/get-points-balance.usecase'
import GetWasteByCategoryUseCase from '../../application/usecases/get-waste-by-category.usecase'
import GetWasteByPeriodUseCase from '../../application/usecases/get-waste-by-period.usecase'
import GetNeighborDeliveriesUseCase from '../../application/usecases/get-neighbor-deliveries.usecase'
import GetNeighborRankingByGreenPointUseCase from '../../application/usecases/get-neighbor-ranking-by-green-point.usecase'

class StatisticsHandler {
  constructor(private readonly repository: StatisticsRepository) {}

  async getTotalRecycled(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to } = req.query
    const useCase = new GetTotalRecycledUseCase(this.repository)
    const result = await useCase.exec(entityId, parseRangeStart(from), parseRangeEnd(to))
    HandleHTTPResponse.OK(rep, 'Total recycled retrieved successfully', result)
  }

  async getCo2Avoided(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to } = req.query
    const useCase = new GetCo2AvoidedUseCase(this.repository)
    const result = await useCase.exec(entityId, parseRangeStart(from), parseRangeEnd(to))
    HandleHTTPResponse.OK(rep, 'CO2 avoided retrieved successfully', result)
  }

  async getPointsBalance(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const useCase = new GetPointsBalanceUseCase(this.repository)
    const result = await useCase.exec(entityId)
    HandleHTTPResponse.OK(rep, 'Points balance retrieved successfully', result)
  }

  async getEntityCounts(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const useCase = new GetEntityCountsUseCase(this.repository)
    const result = await useCase.exec(entityId)
    HandleHTTPResponse.OK(rep, 'Entity counts retrieved successfully', result)
  }

  async getGreenPointsRanking(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to, limit } = req.query
    // Un limit ilegible (o ausente) no debe romper la consulta: se ignora.
    const parsedLimit = Number.parseInt(limit, 10)
    const useCase = new GetGreenPointsRankingUseCase(this.repository)
    const result = await useCase.exec(
      entityId,
      parseRangeStart(from),
      parseRangeEnd(to),
      Number.isNaN(parsedLimit) ? undefined : parsedLimit
    )
    HandleHTTPResponse.OK(rep, 'Green points ranking retrieved successfully', result)
  }

  async getRewardPartnersRanking(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to, limit } = req.query
    const parsedLimit = Number.parseInt(limit, 10)
    const useCase = new GetRewardPartnersRankingUseCase(this.repository)
    const result = await useCase.exec(
      entityId,
      parseRangeStart(from),
      parseRangeEnd(to),
      Number.isNaN(parsedLimit) ? undefined : parsedLimit
    )
    HandleHTTPResponse.OK(rep, 'Reward partners ranking retrieved successfully', result)
  }

  async getWasteByCategory(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to } = req.query
    const useCase = new GetWasteByCategoryUseCase(this.repository)
    const result = await useCase.exec(entityId, parseRangeStart(from), parseRangeEnd(to))
    HandleHTTPResponse.OK(rep, 'Waste by category retrieved successfully', result)
  }

  async getWasteByPeriod(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const entityId = getURLParams(req, 'entityId')
    const { from, to, groupBy } = req.query
    const VALID_GROUP_BY = ['day', 'week', 'month', 'year'] as const
    type GroupBy = (typeof VALID_GROUP_BY)[number]
    const safeGroupBy: GroupBy = VALID_GROUP_BY.includes(groupBy as GroupBy) ? (groupBy as GroupBy) : 'month'
    const useCase = new GetWasteByPeriodUseCase(this.repository)
    const result = await useCase.exec(entityId, safeGroupBy, parseRangeStart(from), parseRangeEnd(to))
    HandleHTTPResponse.OK(rep, 'Waste by period retrieved successfully', result)
  }

  async getNeighborDeliveries(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const neighborId = getURLParams(req, 'neighborId')
    const { from, to } = req.query
    const useCase = new GetNeighborDeliveriesUseCase(this.repository)
    const result = await useCase.exec(neighborId, parseRangeStart(from), parseRangeEnd(to))
    HandleHTTPResponse.OK(rep, 'Neighbor deliveries retrieved successfully', result)
  }

  async getNeighborRankingByGreenPoint(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const greenPointId = getURLParams(req, 'greenPointId')
    const { from, to } = req.query
    const useCase = new GetNeighborRankingByGreenPointUseCase(this.repository)
    const result = await useCase.exec(greenPointId, parseRangeStart(from), parseRangeEnd(to))
    HandleHTTPResponse.OK(rep, 'Neighbor ranking retrieved successfully', result)
  }
}

export default StatisticsHandler
