import type Nullable from '../../../shared/domain/types/nullable.type'
import type CouponTransactionEntity from '../entities/coupon-transaction.entity'
import type RewardPartnerStats from '../types/reward-partner-stats.type'

interface CouponTransactionRepository {
  find: (property: Record<string, string>) => Promise<Nullable<CouponTransactionEntity>>
  findById: (id: string) => Promise<Nullable<CouponTransactionEntity>>
  findByNeighbor: (neighborId: string, offset?: number, limit?: number) => Promise<CouponTransactionEntity[]>
  findByRewardPartner: (rewardPartnerId: string, offset?: number, limit?: number) => Promise<CouponTransactionEntity[]>
  findByCode: (code: string) => Promise<Nullable<CouponTransactionEntity>>
  /**
   * De los `couponIds` dados, cuáles tiene el vecino ADQUIRIDOS (canjeados y sin
   * usar). Una sola consulta para toda la pantalla: lo consume la policy de canje
   * para resolver el catálogo completo sin caer en N+1.
   */
  findHeldCouponIds: (neighborId: string, couponIds: string[]) => Promise<string[]>
  save: (transaction: CouponTransactionEntity) => Promise<Nullable<CouponTransactionEntity>>
  update: (id: string, transaction: CouponTransactionEntity) => Promise<Nullable<CouponTransactionEntity>>
  getRewardPartnerStats: (rewardPartnerId: string, from?: Date, to?: Date) => Promise<RewardPartnerStats>
  /** ADQUIRIDO, vencen dentro de `withinDays` días, y todavía no se avisó. */
  findExpiringSoon: (withinDays: number) => Promise<CouponTransactionEntity[]>
  markExpirationNotified: (id: string) => Promise<void>
}

export default CouponTransactionRepository
