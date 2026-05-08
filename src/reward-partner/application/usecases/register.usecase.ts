import type FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorCannotSaveRewardPartner from '../../domain/errors/cannot-save-reward-partner.error'
import type RewardPartnerPayload from '../../domain/payloads/reward-partner.payload'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class RegisterRewardPartnerUseCase {
  constructor(
    private readonly rewardPartnerrepository: RewardPartnerRepository,
    private readonly findEntityById: FindEntityByIDUseCase
  ) {}

  async exec(payload: RewardPartnerPayload): Promise<RewardPartnerEntity> {
    const entity = await this.findEntityById.exec(payload.entityId)
    const newRewardPartner = new RewardPartnerEntity(payload, entity)

    const rewardPartner = await this.rewardPartnerrepository.save(newRewardPartner)
    if (rewardPartner == null) {
      throw new ErrorCannotSaveRewardPartner()
    }

    return rewardPartner
  }
}

export default RegisterRewardPartnerUseCase
