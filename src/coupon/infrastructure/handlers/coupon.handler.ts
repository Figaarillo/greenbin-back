import { type FastifyReply, type FastifyRequest } from 'fastify'
import FindRewardPartnerByIdUseCase from '../../../reward-partner/application/usecases/find-by-id.usecase'
import type RewardPartnerRepository from '../../../reward-partner/domain/repositories/reward-partner.repository'
import CheckIdDTO from '../../../shared/infrastructure/dto-types/check-id.dto'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getPaginationParams, getURLParams } from '../../../shared/utils/http.request.util'
import DeleteCouponUseCase from '../../application/usecases/delete.usecase'
import FindCouponWithPopulateUseCase from '../../application/usecases/find-and-populate.usecase'
import FindCouponByIDUseCase from '../../application/usecases/find-by-id.usecase'
import ListCouponsUseCase from '../../application/usecases/list.usecase'
import RegisterCouponUseCase from '../../application/usecases/register.usecase'
import UpdateCouponUseCase from '../../application/usecases/update.usecase'
import type CouponPayload from '../../domain/payloads/coupon.payload'
import type CouponUpdatePayload from '../../domain/payloads/coupon.update.payload'
import type CouponRepository from '../../domain/repositories/coupon.repository'
import CouponQueryParams from '../dtos/query-params.dto'
import RegisterCouponDTO from '../dtos/register-coupon.dto'
import UpdateCouponDTO from '../dtos/update-coupon.dto'
import CouponSchemaValidator from '../middlewares/zod-schema-validator.middleware'
import ListAvailableCouponUseCase from '../../application/usecases/list-available-coupon.usecase'

class CouponHandler {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly rewardPartnerRepository: RewardPartnerRepository
  ) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const { offset, limit } = getPaginationParams(req)

    const listCoupons = new ListCouponsUseCase(this.couponRepository)
    const coupons = await listCoupons.exec(offset, limit)

    HandleHTTPResponse.OK(rep, 'Coupons retrieved successfully', coupons)
  }

  async listAvailables(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const { offset, limit } = getPaginationParams(req)

    const listAvailableCoupons = new ListAvailableCouponUseCase(this.couponRepository)
    const coupons = await listAvailableCoupons.exec(offset, limit)

    HandleHTTPResponse.OK(rep, 'Coupons availables retrieved successfully', coupons)
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const validateIDSchema = new CouponSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const findCoupon = new FindCouponByIDUseCase(this.couponRepository)
    const coupon = await findCoupon.exec(id)

    HandleHTTPResponse.OK(rep, 'Coupon retrieved successfully', coupon)
  }

  async findAndPopulate(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const params = CouponQueryParams.parse(req.query)

    const findWithPopulate = new FindCouponWithPopulateUseCase(this.couponRepository)
    const coupon = await findWithPopulate.exec(params.id, params.with)

    HandleHTTPResponse.OK(rep, 'Coupon retrieved successfully', coupon)
  }

  async register(req: FastifyRequest<{ Body: CouponPayload }>, rep: FastifyReply): Promise<void> {
    const validateRegisterCouponsSchema = new CouponSchemaValidator(RegisterCouponDTO, req.body)
    validateRegisterCouponsSchema.exec()

    const findRewardPartner = new FindRewardPartnerByIdUseCase(this.rewardPartnerRepository)
    const registerCoupon = new RegisterCouponUseCase(this.couponRepository, findRewardPartner)
    const coupon = await registerCoupon.exec(req.body)

    HandleHTTPResponse.Created(rep, 'Coupon registered successfully', coupon)
  }

  async update(
    req: FastifyRequest<{ Params: Record<string, string>; Body: CouponUpdatePayload }>,
    rep: FastifyReply
  ): Promise<void> {
    const id = getURLParams(req, 'id')

    const validateIDSchema = new CouponSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const schemaValidator = new CouponSchemaValidator(UpdateCouponDTO, req.body)
    schemaValidator.exec()

    const updateCoupon = new UpdateCouponUseCase(this.couponRepository)
    await updateCoupon.exec(id, req.body)

    HandleHTTPResponse.OK(rep, 'Coupon updated successfully', { id })
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const schemaValidator = new CouponSchemaValidator(CheckIdDTO, { id })
    schemaValidator.exec()

    const deleteCoupon = new DeleteCouponUseCase(this.couponRepository)
    await deleteCoupon.exec(id)

    HandleHTTPResponse.OK(rep, 'Coupon deleted successfully', { id })
  }
}

export default CouponHandler
