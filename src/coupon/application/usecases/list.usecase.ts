import type CouponEntity from '../../domain/entities/coupon.entity'
import ErrorCouponNotFound from '../../domain/errors/coupon-not-found.error'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class ListCouponsUseCase {
  constructor(private readonly repository: CouponRepository) {}

  async exec(offset: number, limit: number): Promise<CouponEntity[]> {
    const coupons = await this.repository.list({}, offset, limit)
    if (coupons == null) {
      throw new ErrorCouponNotFound()
    }

    return coupons
  }
}

export default ListCouponsUseCase
