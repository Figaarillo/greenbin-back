import RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorCannotSaveRewardPartner from '../../domain/errors/cannot-save-reward-partner.error'
import type RewardPartnerPayload from '../../domain/payloads/reward-partner.payload'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class RegisterRewardPartnerUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {
    this.repository = repository
  }

  async exec(payload: RewardPartnerPayload): Promise<RewardPartnerEntity> {
    const newRewardPartner = new RewardPartnerEntity(payload)

    const rewardPartner = await this.repository.save(newRewardPartner)
    if (rewardPartner == null) {
      throw new ErrorCannotSaveRewardPartner()
    }

    return rewardPartner
  }
}

export default RegisterRewardPartnerUseCase
