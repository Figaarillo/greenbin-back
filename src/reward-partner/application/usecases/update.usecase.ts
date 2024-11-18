import type RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorRewardPartnerNotFound from '../../domain/errors/reward-partner-not-found.error'
import type RewardPartnerUpdatePayload from '../../domain/payloads/reward-partner.update.payload'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class UpdateRewardPartnerUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {
    this.repository = repository
  }

  async exec(id: string, payload: RewardPartnerUpdatePayload): Promise<RewardPartnerEntity> {
    const rewardPartnerUpdated = await this.repository.update(id, payload)
    if (rewardPartnerUpdated == null) {
      throw new ErrorRewardPartnerNotFound(id)
    }

    return rewardPartnerUpdated
  }
}

export default UpdateRewardPartnerUseCase
