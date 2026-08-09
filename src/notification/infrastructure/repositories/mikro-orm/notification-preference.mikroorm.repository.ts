import { RequestContext } from '@mikro-orm/core'
import type { Roles } from '../../../../auth/domain/entities/role'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import NotificationPreferenceEntity from '../../../domain/entities/notification-preference.entity'
import type NotificationPreferenceRepository from '../../../domain/repositories/notification-preference.repository'

class NotificationPreferenceMikroORMRepository implements NotificationPreferenceRepository {
  async find(recipientId: string, recipientRole: Roles): Promise<Nullable<NotificationPreferenceEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(NotificationPreferenceEntity, { recipientId, recipientRole })
  }

  async save(preference: NotificationPreferenceEntity): Promise<Nullable<NotificationPreferenceEntity>> {
    const em = this.getEntityManager()
    await em.persist(preference).flush()
    return preference
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private getEntityManager() {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new ErrorEntityManagerNotFound()
    }

    return em
  }
}

export default NotificationPreferenceMikroORMRepository
