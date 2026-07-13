import type { Roles } from '../../../auth/domain/entities/role'
import PushSubscriptionEntity from '../../domain/entities/push-subscription.entity'
import type SubscribePushPayload from '../../domain/payloads/subscribe-push.payload'
import type PushSubscriptionRepository from '../../domain/repositories/push-subscription.repository'

class SubscribePushUseCase {
  constructor(private readonly repository: PushSubscriptionRepository) {}

  async exec(recipientId: string, recipientRole: Roles, payload: SubscribePushPayload): Promise<void> {
    // El mismo endpoint puede volver a suscribirse (re-login, refresh de permiso):
    // upsert por endpoint en lugar de duplicar filas para el mismo dispositivo.
    const existing = await this.repository.findByEndpoint(payload.endpoint)
    if (existing != null) {
      existing.recipientId = recipientId
      existing.recipientRole = recipientRole
      existing.p256dh = payload.keys.p256dh
      existing.auth = payload.keys.auth
      await this.repository.save(existing)
      return
    }

    const subscription = new PushSubscriptionEntity(
      recipientId,
      recipientRole,
      payload.endpoint,
      payload.keys.p256dh,
      payload.keys.auth
    )
    await this.repository.save(subscription)
  }
}

export default SubscribePushUseCase
