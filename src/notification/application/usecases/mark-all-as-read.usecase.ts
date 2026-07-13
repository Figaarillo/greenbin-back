import type { Roles } from '../../../auth/domain/entities/role'
import type NotificationRepository from '../../domain/repositories/notification.repository'

class MarkAllNotificationsAsReadUseCase {
  constructor(private readonly repository: NotificationRepository) {}

  async exec(recipientId: string, recipientRole: Roles): Promise<void> {
    await this.repository.markAllAsRead(recipientId, recipientRole)
  }
}

export default MarkAllNotificationsAsReadUseCase
