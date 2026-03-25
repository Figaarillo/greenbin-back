import type Nullable from '../../../shared/domain/types/nullable.type'
import type CouponTransactionEntity from '../entities/coupon-transaction.entity'

interface CouponTransactionRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<CouponTransactionEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<CouponTransactionEntity>>
  findById: (id: string) => Promise<Nullable<CouponTransactionEntity>>
  findByNeighbor: (neighborId: string) => Promise<CouponTransactionEntity[]>
  findByCode: (code: string) => Promise<Nullable<CouponTransactionEntity>>
  save: (transaction: CouponTransactionEntity) => Promise<Nullable<CouponTransactionEntity>>
  update: (id: string, transaction: CouponTransactionEntity) => Promise<Nullable<CouponTransactionEntity>>
}

export default CouponTransactionRepository
