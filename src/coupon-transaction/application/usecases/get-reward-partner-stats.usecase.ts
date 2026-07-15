import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'
import type RewardPartnerStats from '../../domain/types/reward-partner-stats.type'

class GetRewardPartnerStatsUseCase {
  constructor(private readonly repository: CouponTransactionRepository) {}

  async exec(rewardPartnerId: string, from?: Date, to?: Date): Promise<RewardPartnerStats> {
    return await this.repository.getRewardPartnerStats(rewardPartnerId, from, to)
  }
}

export default GetRewardPartnerStatsUseCase
