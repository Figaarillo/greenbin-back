import type CouponEntity from '../../domain/entities/coupon.entity'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class ListAvailableCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async exec(offset: number, limit: number): Promise<CouponEntity[]> {
    const coupons = await this.couponRepository.list({ available: true }, offset, limit)
    if (coupons == null) {
      throw new Error('No coupons available found')
    }

    return coupons
  }
}

export default ListAvailableCouponUseCase
