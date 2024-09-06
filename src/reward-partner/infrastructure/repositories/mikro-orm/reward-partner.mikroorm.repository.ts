import { type EntityManager } from '@mikro-orm/postgresql'
import { type Services } from '../../../../db'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import RewardPartnerEntity from '../../../domain/entities/reward-partner.entity'
import type RewardPartnerUpdatePayload from '../../../domain/payloads/reward-partner.update.payload'
import type RewardPartnerRepository from '../../../domain/repositories/reward-partner.repository'

class RewardPartnerMikroORMRepository implements RewardPartnerRepository {
  private readonly em: EntityManager

  constructor(private readonly db: Services) {
    this.em = this.db.em.fork()
  }

  async list(_offset: number, _limit: number): Promise<Nullable<RewardPartnerEntity[]>> {
    throw new Error('Method not implemented.')
  }

  async find(_property: Record<string, string>): Promise<Nullable<RewardPartnerEntity>> {
    throw new Error('Method not implemented.')
  }

  async save(rewardPartner: RewardPartnerEntity): Promise<Nullable<RewardPartnerEntity>> {
    const newRewardPartner = this.em.create(RewardPartnerEntity, rewardPartner)
    await this.em.persist(newRewardPartner).flush()

    return newRewardPartner
  }

  async update(id: string, payload: RewardPartnerUpdatePayload): Promise<Nullable<RewardPartnerEntity>> {
    const rewardPartner = this.em.getReference(RewardPartnerEntity, id)
    if (rewardPartner == null) return null

    rewardPartner.update(payload)
    await this.em.flush()

    return rewardPartner
  }

  async delete(_id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export default RewardPartnerMikroORMRepository
