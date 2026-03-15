import type CouponEntity from '../../domain/entities/coupon.entity'
import ErrorCouponNotFound from '../../domain/errors/coupon-not-found.error'
import type CouponUpdatePayload from '../../domain/payloads/coupon.update.payload'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class UpdateCouponUseCase {
  constructor(private readonly repository: CouponRepository) {}

  async exec(id: string, payload: CouponUpdatePayload): Promise<CouponEntity> {
    const CouponUpdated = await this.repository.update(id, payload)
    if (CouponUpdated == null) {
      throw new ErrorCouponNotFound(id)
    }

    return CouponUpdated
  }
}

export default UpdateCouponUseCase
