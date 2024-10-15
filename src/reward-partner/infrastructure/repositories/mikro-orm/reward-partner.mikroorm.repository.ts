import { RequestContext } from '@mikro-orm/postgresql'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import RewardPartnerEntity from '../../../domain/entities/reward-partner.entity'
import ErrorRewardPartnerNotFound from '../../../domain/errors/reward-partner-not-found.error'
import type RewardPartnerUpdatePayload from '../../../domain/payloads/reward-partner.update.payload'
import type RewardPartnerRepository from '../../../domain/repositories/reward-partner.repository'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'

class RewardPartnerMikroORMRepository implements RewardPartnerRepository {
  async list(offset: number, limit: number): Promise<Nullable<RewardPartnerEntity[]>> {
    const em = this.getEntityManager()
    return await em.find(RewardPartnerEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<RewardPartnerEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(RewardPartnerEntity, property)
  }

  async findWithPassword(property: Record<string, string>): Promise<Nullable<RewardPartnerEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(RewardPartnerEntity, property, { populate: ['password'] })
  }

  async save(newRewardPartner: RewardPartnerEntity): Promise<Nullable<RewardPartnerEntity>> {
    const em = this.getEntityManager()

    await em.persist(newRewardPartner).flush()

    return newRewardPartner
  }

  async update(id: string, payload: RewardPartnerUpdatePayload): Promise<Nullable<RewardPartnerEntity>> {
    const em = this.getEntityManager()

    const rewardPartner = em.getReference(RewardPartnerEntity, id)
    if (rewardPartner == null) return null

    rewardPartner.update(payload)
    await em.flush()

    return rewardPartner
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const rewardPartner = em.getReference(RewardPartnerEntity, id)
    if (rewardPartner == null) {
      throw new ErrorRewardPartnerNotFound(id, undefined, undefined)
    }

    await em.remove(rewardPartner).flush()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private getEntityManager() {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new ErrorEntityManagerNotFound()
    }

    return em
  }
}

export default RewardPartnerMikroORMRepository
