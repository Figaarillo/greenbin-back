import type CouponEntity from '../../domain/entities/coupon.entity'
import ErrorCannotUpdateCoupon from '../../domain/errors/cannot-update.error'
import type CouponUpdatePayload from '../../domain/payloads/coupon.update.payload'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class UpdateCouponUseCase {
  constructor(private readonly repository: CouponRepository) {}

  async exec(id: string, payload: CouponUpdatePayload): Promise<CouponEntity> {
    const CouponUpdated = await this.repository.update(id, payload)
    if (CouponUpdated == null) {
      throw new ErrorCannotUpdateCoupon(id)
    }

    return CouponUpdated
  }
}

export default UpdateCouponUseCase
