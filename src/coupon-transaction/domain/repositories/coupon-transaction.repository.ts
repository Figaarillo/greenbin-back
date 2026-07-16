import type Nullable from '../../../shared/domain/types/nullable.type'
import type CouponTransactionEntity from '../entities/coupon-transaction.entity'
import type RewardPartnerStats from '../types/reward-partner-stats.type'

interface CouponTransactionRepository {
  list: (offset?: number, limit?: number) => Promise<Nullable<CouponTransactionEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<CouponTransactionEntity>>
  findById: (id: string) => Promise<Nullable<CouponTransactionEntity>>
  findByNeighbor: (neighborId: string, offset?: number, limit?: number) => Promise<CouponTransactionEntity[]>
  findByRewardPartner: (rewardPartnerId: string, offset?: number, limit?: number) => Promise<CouponTransactionEntity[]>
  findByCode: (code: string) => Promise<Nullable<CouponTransactionEntity>>
  save: (transaction: CouponTransactionEntity) => Promise<Nullable<CouponTransactionEntity>>
  update: (id: string, transaction: CouponTransactionEntity) => Promise<Nullable<CouponTransactionEntity>>
  getRewardPartnerStats: (rewardPartnerId: string, from?: Date, to?: Date) => Promise<RewardPartnerStats>
}

export default CouponTransactionRepository
