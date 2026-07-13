import type { Roles } from '../../../auth/domain/entities/role'
import type Nullable from '../../../shared/domain/types/nullable.type'
import type PushSubscriptionEntity from '../entities/push-subscription.entity'

interface PushSubscriptionRepository {
  save: (subscription: PushSubscriptionEntity) => Promise<Nullable<PushSubscriptionEntity>>
  findByEndpoint: (endpoint: string) => Promise<Nullable<PushSubscriptionEntity>>
  findByRecipient: (recipientId: string, recipientRole: Roles) => Promise<PushSubscriptionEntity[]>
  deleteByEndpoint: (endpoint: string) => Promise<void>
}

export default PushSubscriptionRepository
