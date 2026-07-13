import type { Roles } from '../../../auth/domain/entities/role'
import type NotificationRepository from '../../domain/repositories/notification.repository'

class CountUnreadNotificationsUseCase {
  constructor(private readonly repository: NotificationRepository) {}

  async exec(recipientId: string, recipientRole: Roles): Promise<number> {
    return await this.repository.countUnread(recipientId, recipientRole)
  }
}

export default CountUnreadNotificationsUseCase
