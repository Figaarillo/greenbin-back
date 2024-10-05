import type Nullable from '../../../shared/domain/types/nullable.type'
import type RewardPartnerEntity from '../entities/reward-partner.entity'
import type RewardPartnerUpdatePayload from '../payloads/reward-partner.update.payload'

interface RewardPartnerRepository {
  list: (offset: number, limit: number) => Promise<Nullable<RewardPartnerEntity[]>>
  find: (property: Record<string, string>) => Promise<Nullable<RewardPartnerEntity>>
  findWithPassword: (property: Record<string, string>) => Promise<Nullable<RewardPartnerEntity>>
  save: (rewardPartner: RewardPartnerEntity) => Promise<Nullable<RewardPartnerEntity>>
  update: (id: string, payload: RewardPartnerUpdatePayload) => Promise<Nullable<RewardPartnerEntity>>
  delete: (id: string) => Promise<void>
}

export default RewardPartnerRepository
