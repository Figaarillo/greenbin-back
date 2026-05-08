import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'
import type CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'

class ListByRewardPartnerUseCase {
  constructor(private readonly repository: CouponTransactionRepository) {}

  async exec(rewardPartnerId: string): Promise<CouponTransactionEntity[]> {
    return await this.repository.findByRewardPartner(rewardPartnerId)
  }
}

export default ListByRewardPartnerUseCase
