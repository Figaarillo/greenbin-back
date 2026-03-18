import type CouponEntity from '../../domain/entities/coupon.entity'
import ErrorNoCouponsAvailable from '../../domain/errors/no-coupons-available.error'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class ListAvailableCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async exec(offset: number, limit: number): Promise<CouponEntity[]> {
    const coupons = await this.couponRepository.list({ isAvailable: true }, offset, limit)
    if (coupons == null) {
      throw new ErrorNoCouponsAvailable()
    }

    return coupons
  }
}

export default ListAvailableCouponUseCase
