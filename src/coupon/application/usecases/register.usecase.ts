import type FindRewardPartnerByIdUseCase from '../../../reward-partner/aplication/usecases/find-by-id.usecase'
import CouponEntity from '../../domain/entities/coupon.entity'
import ErrorCannotSaveCoupon from '../../domain/errors/cannot-save-coupon.error'
import type CouponPayload from '../../domain/payloads/coupon.payload'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class RegisterCouponUseCase {
  constructor(
    private readonly repository: CouponRepository,
    private readonly findRewardPartner: FindRewardPartnerByIdUseCase
  ) {}

  async exec(payload: CouponPayload): Promise<CouponEntity> {
    const rewardPartner = await this.findRewardPartner.exec(payload.rewardPartnerId)
    const newCoupon = new CouponEntity(payload, rewardPartner)

    const coupon = await this.repository.save(newCoupon)
    if (coupon == null) {
      throw new ErrorCannotSaveCoupon()
    }

    return coupon
  }
}

export default RegisterCouponUseCase
