import type Nullable from '../../../shared/domain/types/nullable.type'
import type CouponEntity from '../entities/coupon.entity'
import type CouponPayload from '../payloads/coupon.payload'
import type { CouponRelationship } from '../enums/coupon.enum'

interface CouponRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<CouponEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<CouponEntity>>
  findAndPopulate: (property: Record<string, string>, populate: CouponRelationship[]) => Promise<Nullable<CouponEntity>>
  save: (category: CouponEntity) => Promise<Nullable<CouponEntity>>
  update: (id: string, payload: CouponPayload) => Promise<Nullable<CouponEntity>>
  delete: (id: string) => Promise<void>
}

export default CouponRepository
