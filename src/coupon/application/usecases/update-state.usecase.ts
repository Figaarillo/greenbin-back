import type CouponRepository from '../../domain/repositories/coupon.repository'

class UpdateCouponStateUseCase {
  constructor(private readonly repository: CouponRepository) {}

  async exec(id: string, state: string): Promise<void> {
    const couponUpdated = await this.repository.update(id, { state })
    if (couponUpdated == null) {
      throw new Error('Error updating coupon state to coupon with id: ' + id)
    }
  }
}

export default UpdateCouponStateUseCase
