import type { Roles } from '../../../auth/domain/entities/role'
import type { NotificationCategory } from '../enums/notification-category.enum'

interface RegisterNotificationPayload {
  recipientId: string
  recipientRole: Roles
  category: NotificationCategory
  title: string
  body: string
}

export default RegisterNotificationPayload
