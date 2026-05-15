import type CouponEntity from '../../domain/entities/coupon.entity'
import ErrorNoCouponsAvailable from '../../domain/errors/no-coupons-available.error'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class ListAvailableCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async exec(offset: number, limit: number, entityId?: string): Promise<CouponEntity[]> {
    const where: Record<string, any> = { isAvailable: true }
    if (entityId != null && entityId !== '') {
      where.rewardPartner = { entity: entityId }
    }

    const coupons = await this.couponRepository.list(where, offset, limit)
    if (coupons == null) {
      throw new ErrorNoCouponsAvailable()
    }

    return coupons
  }
}

export default ListAvailableCouponUseCase
