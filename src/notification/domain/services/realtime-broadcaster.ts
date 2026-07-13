import type { Roles } from '../../../auth/domain/entities/role'
import type { NotificationCategory } from '../enums/notification-category.enum'

interface RealtimeEvent {
  category: NotificationCategory
  title: string
  body: string
  data?: Record<string, unknown>
}

interface RealtimeBroadcaster {
  send: (recipientId: string, recipientRole: Roles, event: RealtimeEvent) => void
}

export default RealtimeBroadcaster
export type { RealtimeEvent }
