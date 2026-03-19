import type CouponEntity from '../../domain/entities/coupon.entity'
import ErrorCouponNotFound from '../../domain/errors/coupon-not-found.error'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class FindCouponByIDUseCase {
  constructor(private readonly repository: CouponRepository) {}

  async exec(id: string): Promise<CouponEntity> {
    const coupon = await this.repository.find({ id })
    if (coupon == null) {
      throw new ErrorCouponNotFound(id)
    }

    return coupon
  }
}

export default FindCouponByIDUseCase
