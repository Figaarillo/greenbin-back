import { type FastifyReply, type FastifyRequest } from 'fastify'
import FindRewardPartnerByIdUseCase from '../../../reward-partner/aplication/usecases/find-by-id.usecase'
import type RewardPartnerRepository from '../../../reward-partner/domain/repositories/reward-partner.repository'
import { idDTO } from '../../../shared/infrastructure/dto-types/dto-types'
import SchemaValidator from '../../../shared/infrastructure/middlewares/zod-schema-validator.middleware'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import FindCouponByIDUseCase from '../../application/usecases/find-by-id.usecase'
import ListCouponsUseCase from '../../application/usecases/list.usecase'
import RegisterCouponUseCase from '../../application/usecases/register.usecase'
import type CouponPayload from '../../domain/payloads/coupon.payload'
import type CouponRepository from '../../domain/repositories/coupon.repository'
import RegisterCouponDTO from '../dtos/register-coupon.dto'

class CouponHandler {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly rewardPartnerRepository: RewardPartnerRepository
  ) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const listCoupons = new ListCouponsUseCase(this.couponRepository)
      const entities = await listCoupons.exec(offset, limit)

      HandleHTTPResponse.OK(res, 'Coupons retrieved successfully', entities)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(idDTO, { id })
      validateIDSchema.exec()

      const findCoupon = new FindCouponByIDUseCase(this.couponRepository)
      const coupon = await findCoupon.exec(id)

      HandleHTTPResponse.OK(res, 'Coupon retrieved successfully', coupon)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async register(req: FastifyRequest<{ Body: CouponPayload }>, res: FastifyReply): Promise<void> {
    try {
      const validateRegisterCategoriesSchema = new SchemaValidator(RegisterCouponDTO, req.body)
      validateRegisterCategoriesSchema.exec()

      const findRewardPartner = new FindRewardPartnerByIdUseCase(this.rewardPartnerRepository)
      const registerCoupon = new RegisterCouponUseCase(this.couponRepository, findRewardPartner)
      const coupon = await registerCoupon.exec(req.body)

      HandleHTTPResponse.Created(res, 'Coupon registered successfully', { id: coupon.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default CouponHandler
