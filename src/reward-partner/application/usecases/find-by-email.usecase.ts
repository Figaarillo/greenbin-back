import type RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorRewardPartnerNotFound from '../../domain/errors/reward-partner-not-found.error'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class FindByEmailUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {
    this.repository = repository
  }

  async exec(email: string): Promise<RewardPartnerEntity> {
    const rewardPartner = await this.repository.find({ email })
    if (rewardPartner == null) throw new ErrorRewardPartnerNotFound(undefined, undefined, email)
    return rewardPartner
  }
}

export default FindByEmailUseCase
