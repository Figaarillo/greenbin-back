import type { Roles } from '../../../auth/domain/entities/role'
import type NotificationEntity from '../../domain/entities/notification.entity'
import type NotificationRepository from '../../domain/repositories/notification.repository'

class ListNotificationsByRecipientUseCase {
  constructor(private readonly repository: NotificationRepository) {}

  async exec(
    recipientId: string,
    recipientRole: Roles,
    offset?: number,
    limit?: number
  ): Promise<NotificationEntity[]> {
    return await this.repository.findByRecipient(recipientId, recipientRole, offset, limit)
  }
}

export default ListNotificationsByRecipientUseCase
