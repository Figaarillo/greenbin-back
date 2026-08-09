/* eslint-disable indent */
import { Entity, Enum, Index, Property } from '@mikro-orm/postgresql'
import { Roles } from '../../../auth/domain/entities/role'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import { NotificationCategory } from '../enums/notification-category.enum'

// recipientId/recipientRole son columnas planas, sin FK real: el destinatario
// puede ser un Neighbor, un RewardPartner o un Responsible, y MikroORM no tiene
// un patron limpio de FK polimorfica entre 3 tablas distintas. Mismo criterio
// que ya usa el JWT (AuthUser.sub + AuthUser.role) para identificar un usuario
// sin relacion formal.
@Entity({ tableName: 'notifications' })
@Index({ properties: ['recipientId', 'recipientRole'] })
class NotificationEntity extends BaseEntity {
  @Property()
  recipientId: string

  @Enum({ items: () => Roles })
  recipientRole: Roles

  @Enum({ items: () => NotificationCategory })
  category: NotificationCategory

  @Property()
  title: string

  @Property({ type: 'text' })
  body: string

  @Property({ nullable: true })
  readAt?: Date

  constructor(recipientId: string, recipientRole: Roles, category: NotificationCategory, title: string, body: string) {
    super()
    this.recipientId = recipientId
    this.recipientRole = recipientRole
    this.category = category
    this.title = title
    this.body = body
  }

  markAsRead(): void {
    this.readAt = new Date()
  }

  get isRead(): boolean {
    return this.readAt != null
  }
}

export default NotificationEntity
