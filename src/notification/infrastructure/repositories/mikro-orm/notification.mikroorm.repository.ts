import { RequestContext } from '@mikro-orm/core'
import type { Roles } from '../../../../auth/domain/entities/role'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import NotificationEntity from '../../../domain/entities/notification.entity'
import type NotificationRepository from '../../../domain/repositories/notification.repository'

class NotificationMikroORMRepository implements NotificationRepository {
  async save(notification: NotificationEntity): Promise<Nullable<NotificationEntity>> {
    const em = this.getEntityManager()
    await em.persist(notification).flush()
    return notification
  }

  async findById(id: string): Promise<Nullable<NotificationEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(NotificationEntity, { id })
  }

  async findByRecipient(
    recipientId: string,
    recipientRole: Roles,
    offset = 0,
    limit = 20
  ): Promise<NotificationEntity[]> {
    const em = this.getEntityManager()
    return await em.find(
      NotificationEntity,
      { recipientId, recipientRole },
      { orderBy: { createdAt: 'desc' }, offset, limit }
    )
  }

  async countUnread(recipientId: string, recipientRole: Roles): Promise<number> {
    const em = this.getEntityManager()
    return await em.count(NotificationEntity, { recipientId, recipientRole, readAt: null })
  }

  async update(id: string, notification: NotificationEntity): Promise<Nullable<NotificationEntity>> {
    const em = this.getEntityManager()

    const entity = await em.findOne(NotificationEntity, { id })
    if (entity == null) return null

    entity.readAt = notification.readAt
    await em.flush()

    return entity
  }

  async markAllAsRead(recipientId: string, recipientRole: Roles): Promise<void> {
    const em = this.getEntityManager()
    await em.nativeUpdate(NotificationEntity, { recipientId, recipientRole, readAt: null }, { readAt: new Date() })
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

export default NotificationMikroORMRepository
