import type { Roles } from '../../../auth/domain/entities/role'
import type NotificationPreferenceEntity from '../../domain/entities/notification-preference.entity'
import type NotificationPreferencePatch from '../../domain/payloads/notification-preference.payload'
import type NotificationPreferenceRepository from '../../domain/repositories/notification-preference.repository'
import type FindOrCreateNotificationPreferenceUseCase from './find-or-create-preference.usecase'

class UpdateNotificationPreferenceUseCase {
  constructor(
    private readonly findOrCreate: FindOrCreateNotificationPreferenceUseCase,
    private readonly repository: NotificationPreferenceRepository
  ) {}

  async exec(
    recipientId: string,
    recipientRole: Roles,
    patch: NotificationPreferencePatch
  ): Promise<NotificationPreferenceEntity> {
    const preference = await this.findOrCreate.exec(recipientId, recipientRole)
    preference.updateFrom(patch)

    const saved = await this.repository.save(preference)
    if (saved == null) {
      throw new Error('Cannot update notification preference')
    }

    return saved
  }
}

export default UpdateNotificationPreferenceUseCase
