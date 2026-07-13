import NotificationEntity from '../../domain/entities/notification.entity'
import type RegisterNotificationPayload from '../../domain/payloads/register-notification.payload'
import type NotificationRepository from '../../domain/repositories/notification.repository'

class RegisterNotificationUseCase {
  constructor(private readonly repository: NotificationRepository) {}

  async exec(payload: RegisterNotificationPayload): Promise<NotificationEntity> {
    const notification = new NotificationEntity(
      payload.recipientId,
      payload.recipientRole,
      payload.category,
      payload.title,
      payload.body
    )

    const saved = await this.repository.save(notification)
    if (saved == null) {
      throw new Error('Cannot save notification')
    }

    return saved
  }
}

export default RegisterNotificationUseCase
