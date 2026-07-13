import type { Roles } from '../../../auth/domain/entities/role'
import NotificationPreferenceEntity from '../../domain/entities/notification-preference.entity'
import type NotificationPreferenceRepository from '../../domain/repositories/notification-preference.repository'

class FindOrCreateNotificationPreferenceUseCase {
  constructor(private readonly repository: NotificationPreferenceRepository) {}

  async exec(recipientId: string, recipientRole: Roles): Promise<NotificationPreferenceEntity> {
    const existing = await this.repository.find(recipientId, recipientRole)
    if (existing != null) return existing

    // Sin fila todavía = nunca tocó sus preferencias: se crea con los defaults
    // (todo en true) para no repetir el null-check en cada consumidor.
    const created = await this.repository.save(new NotificationPreferenceEntity(recipientId, recipientRole))
    if (created == null) {
      throw new Error('Cannot create notification preference')
    }

    return created
  }
}

export default FindOrCreateNotificationPreferenceUseCase
