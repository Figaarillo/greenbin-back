import { type FastifyReply, type FastifyRequest } from 'fastify'
import { parseRangeStart, parseRangeEnd } from '../../../shared/utils/date-range.util'
import FindCouponByIDUseCase from '../../../coupon/application/usecases/find-by-id.usecase'
import type CouponRepository from '../../../coupon/domain/repositories/coupon.repository'
import FindNeighborByIDUseCase from '../../../neighbor/application/usecases/find-by-id.usecase'
import SubtractNeighborPointsUseCase from '../../../neighbor/application/usecases/substrac-points.usecase'
import type NeighborRepository from '../../../neighbor/domain/repositories/neighbor.repository'
import FindRewardPartnerByIdUseCase from '../../../reward-partner/application/usecases/find-by-id.usecase'
import type RewardPartnerRepository from '../../../reward-partner/domain/repositories/reward-partner.repository'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import RedeemCouponUseCase from '../../application/usecases/redeem-coupon.usecase'
import type RedeemCouponPayload from '../../domain/payloads/redeem-coupon.payload'
import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'
import CouponSchemaValidator from '../../../coupon/infrastructure/middlewares/zod-schema-validator.middleware'
import CheckIdDTO from '../../../shared/infrastructure/dto-types/check-id.dto'
import { getURLParams } from '../../../shared/utils/http.request.util'
import FindCouponTransactionByIDUseCase from '../../application/usecases/find-by-id.usecase'
import UseCouponUseCase from '../../application/usecases/use-coupon.usecase'
import type UseCouponPayload from '../../domain/payloads/use-coupon.payload'
import UseCouponDTO from '../dtos/use-coupon.dto'
import ListByNeighborUseCase from '../../application/usecases/list-by-neighbor.usecase'
import ListByRewardPartnerUseCase from '../../application/usecases/list-by-reward-partner.usecase'
import GetRewardPartnerStatsUseCase from '../../application/usecases/get-reward-partner-stats.usecase'
import createNotificationDispatcher from '../../../notification/notification-dispatcher.factory'

class CouponTransactionHandler {
  constructor(
    private readonly couponTransactionRepository: CouponTransactionRepository,
    private readonly couponRepository: CouponRepository,
    private readonly neighborRepository: NeighborRepository,
    private readonly rewardPartnerRepository: RewardPartnerRepository
  ) {}

  async redeemCoupon(req: FastifyRequest<{ Body: RedeemCouponPayload }>, rep: FastifyReply): Promise<void> {
    try {
      const findCouponById = new FindCouponByIDUseCase(this.couponRepository)
      const findNeighborById = new FindNeighborByIDUseCase(this.neighborRepository)
      const findRewardPartnerById = new FindRewardPartnerByIdUseCase(this.rewardPartnerRepository)
      const subtractPoints = new SubtractNeighborPointsUseCase(this.neighborRepository)
      const redeemCouponUseCase = new RedeemCouponUseCase(
        this.couponTransactionRepository,
        findCouponById,
        findNeighborById,
        findRewardPartnerById,
        subtractPoints,
        createNotificationDispatcher()
      )
      const redeemedCoupon = await redeemCouponUseCase.exec(req.body)

      HandleHTTPResponse.Created(rep, 'Coupon redeemed successfully', redeemedCoupon)
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const id = getURLParams(req, 'id')

      const validateIDSchema = new CouponSchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findTransaction = new FindCouponTransactionByIDUseCase(this.couponTransactionRepository)
      const transaction = await findTransaction.exec(id)

      HandleHTTPResponse.OK(rep, 'Coupon transaction retrieved successfully', transaction)
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }

  async listByNeighbor(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    try {
      const neighborId = getURLParams(req, 'neighborId')
      const { offset, limit } = this.optionalPagination(req)

      const listByNeighborUseCase = new ListByNeighborUseCase(this.couponTransactionRepository)
      const transactions = await listByNeighborUseCase.exec(neighborId, offset, limit)

      HandleHTTPResponse.OK(rep, 'Coupon transactions retrieved successfully', transactions)
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }

  async listByRewardPartner(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    try {
      const rewardPartnerId = getURLParams(req, 'rewardPartnerId')
      const { offset, limit } = this.optionalPagination(req)

      const listByRewardPartnerUseCase = new ListByRewardPartnerUseCase(this.couponTransactionRepository)
      const transactions = await listByRewardPartnerUseCase.exec(rewardPartnerId, offset, limit)

      HandleHTTPResponse.OK(rep, 'Coupon transactions retrieved successfully', transactions)
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }

  async getRewardPartnerStats(
    req: FastifyRequest<{ Params: Record<string, string>; Querystring: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    try {
      const rewardPartnerId = getURLParams(req, 'rewardPartnerId')
      const { from, to } = req.query

      const getStatsUseCase = new GetRewardPartnerStatsUseCase(this.couponTransactionRepository)
      // Mismo bug que tenía statistics: `to=YYYY-MM-DD` se leía como medianoche
      // y dejaba afuera todos los canjes del día en curso.
      const stats = await getStatsUseCase.exec(rewardPartnerId, parseRangeStart(from), parseRangeEnd(to))

      HandleHTTPResponse.OK(rep, 'Reward partner stats retrieved successfully', stats)
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }

  // offset/limit son genuinamente opcionales acá (a diferencia de
  // getPaginationParams, que exige ambos): sin ellos, el endpoint sigue
  // devolviendo la lista completa como siempre.
  private optionalPagination(req: FastifyRequest<{ Querystring: Record<string, string> }>): {
    offset?: number
    limit?: number
  } {
    const rawOffset = req.query.offset
    const rawLimit = req.query.limit
    const offset = rawOffset != null && rawOffset !== '' ? parseInt(rawOffset) : undefined
    const limit = rawLimit != null && rawLimit !== '' ? parseInt(rawLimit) : undefined
    return {
      offset: offset != null && !Number.isNaN(offset) ? offset : undefined,
      limit: limit != null && !Number.isNaN(limit) ? limit : undefined
    }
  }

  async useCoupon(req: FastifyRequest<{ Body: UseCouponPayload }>, rep: FastifyReply): Promise<void> {
    try {
      const payload = req.body

      const schemaValidator = new CouponSchemaValidator(UseCouponDTO, payload)
      schemaValidator.exec()

      const useCoupon = new UseCouponUseCase(this.couponTransactionRepository, createNotificationDispatcher())
      const result = await useCoupon.exec(payload)

      HandleHTTPResponse.OK(rep, 'Coupon used successfully', {
        transactionId: result.id,
        couponTitle: result.coupon.title,
        discount: result.coupon.discount,
        status: result.status
      })
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }
}

export default CouponTransactionHandler
