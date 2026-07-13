import { RequestContext } from '@mikro-orm/core'
import type { Roles } from '../../../../auth/domain/entities/role'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import PushSubscriptionEntity from '../../../domain/entities/push-subscription.entity'
import type PushSubscriptionRepository from '../../../domain/repositories/push-subscription.repository'

class PushSubscriptionMikroORMRepository implements PushSubscriptionRepository {
  async save(subscription: PushSubscriptionEntity): Promise<Nullable<PushSubscriptionEntity>> {
    const em = this.getEntityManager()
    await em.persist(subscription).flush()
    return subscription
  }

  async findByEndpoint(endpoint: string): Promise<Nullable<PushSubscriptionEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(PushSubscriptionEntity, { endpoint })
  }

  async findByRecipient(recipientId: string, recipientRole: Roles): Promise<PushSubscriptionEntity[]> {
    const em = this.getEntityManager()
    return await em.find(PushSubscriptionEntity, { recipientId, recipientRole })
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    const em = this.getEntityManager()
    await em.nativeDelete(PushSubscriptionEntity, { endpoint })
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

export default PushSubscriptionMikroORMRepository
