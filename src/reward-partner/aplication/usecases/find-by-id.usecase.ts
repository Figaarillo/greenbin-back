import type RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorRewardPartnerNotFound from '../../domain/errors/reward-partner-not-found.error'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class FindRewardPartnerByIdUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {}

  async exec(id: string): Promise<RewardPartnerEntity> {
    const rewardPartner = await this.repository.find({ id })
    if (rewardPartner == null) {
      throw new ErrorRewardPartnerNotFound(id)
    }

    return rewardPartner
  }
}

export default FindRewardPartnerByIdUseCase
