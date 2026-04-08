import type RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorRewardPartnerNotFound from '../../domain/errors/reward-partner-not-found.error'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class ListRewardPartnerUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {}

  async exec(offset: number, limit: number, entityId?: string): Promise<RewardPartnerEntity[]> {
    const rewardPartner = await this.repository.list(offset, limit, entityId)
    if (rewardPartner == null) {
      throw new ErrorRewardPartnerNotFound()
    }

    return rewardPartner
  }
}

export default ListRewardPartnerUseCase
