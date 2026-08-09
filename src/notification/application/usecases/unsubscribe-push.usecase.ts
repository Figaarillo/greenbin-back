import type { Roles } from '../../../auth/domain/entities/role'
import type PushSubscriptionRepository from '../../domain/repositories/push-subscription.repository'

class UnsubscribePushUseCase {
  constructor(private readonly repository: PushSubscriptionRepository) {}

  async exec(endpoint: string, recipientId: string, recipientRole: Roles): Promise<void> {
    const subscription = await this.repository.findByEndpoint(endpoint)

    // Nunca borrar por endpoint "a ciegas": sin este chequeo, cualquier
    // usuario notificable que consiga el endpoint de otro (log filtrado,
    // dispositivo compartido) podria borrarle la suscripcion push. Si no es
    // del que pide el unsubscribe, se trata como no-op -- mismo 200 que un
    // delete exitoso, sin confirmar si el endpoint existe o es de otro.
    if (
      subscription == null ||
      subscription.recipientId !== recipientId ||
      subscription.recipientRole !== recipientRole
    ) {
      return
    }

    await this.repository.deleteByEndpoint(endpoint)
  }
}

export default UnsubscribePushUseCase
