import { type FastifyReply, type FastifyRequest } from 'fastify'
import FindCouponByIDUseCase from '../../../coupon/application/usecases/find-by-id.usecase'
import UpdateCouponStateUseCase from '../../../coupon/application/usecases/update-state.usecase'
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
      const updateState = new UpdateCouponStateUseCase(this.couponRepository)
      const redeemCouponUseCase = new RedeemCouponUseCase(
        this.couponTransactionRepository,
        findCouponById,
        findNeighborById,
        findRewardPartnerById,
        subtractPoints,
        updateState
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

  async listByNeighbor(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const neighborId = getURLParams(req, 'neighborId')

      const listByNeighborUseCase = new ListByNeighborUseCase(this.couponTransactionRepository)
      const transactions = await listByNeighborUseCase.exec(neighborId)

      HandleHTTPResponse.OK(rep, 'Coupon transactions retrieved successfully', transactions)
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }

  async listByRewardPartner(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const rewardPartnerId = getURLParams(req, 'rewardPartnerId')

      const listByRewardPartnerUseCase = new ListByRewardPartnerUseCase(this.couponTransactionRepository)
      const transactions = await listByRewardPartnerUseCase.exec(rewardPartnerId)

      HandleHTTPResponse.OK(rep, 'Coupon transactions retrieved successfully', transactions)
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }

  async useCoupon(req: FastifyRequest<{ Body: UseCouponPayload }>, rep: FastifyReply): Promise<void> {
    try {
      const payload = req.body

      const schemaValidator = new CouponSchemaValidator(UseCouponDTO, payload)
      schemaValidator.exec()

      const useCoupon = new UseCouponUseCase(this.couponTransactionRepository)
      const result = await useCoupon.exec(payload)

      HandleHTTPResponse.OK(rep, 'Coupon used successfully', {
        transactionId: result.transaction.id,
        couponTitle: result.transaction.coupon.title,
        discount: result.transaction.coupon.discount,
        finalAmount: result.finalAmount,
        status: result.transaction.status
      })
    } catch (error: any) {
      const statusCode = error.code || (error.message?.includes('not found') ? 404 : 500)
      rep.status(statusCode).send({ message: error.message })
    }
  }
}

export default CouponTransactionHandler
