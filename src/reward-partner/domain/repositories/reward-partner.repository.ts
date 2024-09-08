import type Nullable from '../../../shared/domain/types/nullable.type'
import type RewardPartnerEntity from '../entities/reward-partner.entity'
import type RewardPartnerUpdatePayload from '../payloads/reward-partner.update.payload'

interface RewardPartnerRepository {
  save: (rewardPartner: RewardPartnerEntity) => Promise<Nullable<RewardPartnerEntity>>
  update: (id: string, payload: RewardPartnerUpdatePayload) => Promise<Nullable<RewardPartnerEntity>>
}

export default RewardPartnerRepository
