import type RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorRewardPartnerNotFound from '../../domain/errors/reward-partner-not-found.error'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class FindRewardPartnerByIDUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {
    this.repository = repository
  }

  async exec(id: string): Promise<RewardPartnerEntity> {
    const categoryFound = await this.repository.find({ id })
    if (categoryFound == null) {
      throw new ErrorRewardPartnerNotFound(id)
    }

    return categoryFound
  }
}

export default FindRewardPartnerByIDUseCase
