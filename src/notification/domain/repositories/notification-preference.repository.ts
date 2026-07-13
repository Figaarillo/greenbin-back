import type { Roles } from '../../../auth/domain/entities/role'
import type Nullable from '../../../shared/domain/types/nullable.type'
import type NotificationPreferenceEntity from '../entities/notification-preference.entity'

interface NotificationPreferenceRepository {
  find: (recipientId: string, recipientRole: Roles) => Promise<Nullable<NotificationPreferenceEntity>>
  save: (preference: NotificationPreferenceEntity) => Promise<Nullable<NotificationPreferenceEntity>>
}

export default NotificationPreferenceRepository
