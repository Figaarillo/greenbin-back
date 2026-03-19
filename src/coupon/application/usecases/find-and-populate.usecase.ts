import type CouponEntity from '../../domain/entities/coupon.entity'
import { type CouponRelationship } from '../../domain/enums/coupon.enum'
import ErrorCouponNotFound from '../../domain/errors/coupon-not-found.error'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class FindCouponWithPopulateUseCase {
  constructor(private readonly repository: CouponRepository) {}

  async exec(id: string, populateWith: CouponRelationship[]): Promise<CouponEntity> {
    const coupon = await this.repository.findAndPopulate({ id }, populateWith)
    if (coupon == null) {
      throw new ErrorCouponNotFound(id)
    }

    return coupon
  }
}

export default FindCouponWithPopulateUseCase
