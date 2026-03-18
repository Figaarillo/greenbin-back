import type Nullable from '../../../shared/domain/types/nullable.type'
import type CouponEntity from '../entities/coupon.entity'
import type { CouponRelationship } from '../enums/coupon.enum'
import type CouponUpdatePayload from '../payloads/coupon.update.payload'

interface CouponRepository {
  list: (where: Record<string, any>, offset?: number, limit?: number) => Promise<Nullable<CouponEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<CouponEntity>>
  findAndPopulate: (property: Record<string, string>, populate: CouponRelationship[]) => Promise<Nullable<CouponEntity>>
  save: (coupon: CouponEntity) => Promise<Nullable<CouponEntity>>
  update: (id: string, payload: CouponUpdatePayload) => Promise<Nullable<CouponEntity>>
  delete: (id: string) => Promise<void>
}

export default CouponRepository
