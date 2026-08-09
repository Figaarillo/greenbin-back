import type { Roles } from '../../../auth/domain/entities/role'
import type Nullable from '../../../shared/domain/types/nullable.type'
import type NotificationEntity from '../entities/notification.entity'

interface NotificationRepository {
  save: (notification: NotificationEntity) => Promise<Nullable<NotificationEntity>>
  findById: (id: string) => Promise<Nullable<NotificationEntity>>
  findByRecipient: (
    recipientId: string,
    recipientRole: Roles,
    offset?: number,
    limit?: number
  ) => Promise<NotificationEntity[]>
  countUnread: (recipientId: string, recipientRole: Roles) => Promise<number>
  update: (id: string, notification: NotificationEntity) => Promise<Nullable<NotificationEntity>>
  markAllAsRead: (recipientId: string, recipientRole: Roles) => Promise<void>
}

export default NotificationRepository
