/* eslint-disable indent */
import { Entity, Enum, Property, Unique } from '@mikro-orm/postgresql'
import { Roles } from '../../../auth/domain/entities/role'
import BaseEntity from '../../../shared/domain/entities/base.entity'

// Una fila por dispositivo/navegador suscripto (no por usuario): el mismo
// recipient puede tener varias suscripciones activas (celular + desktop).
// `endpoint` es unico porque el navegador lo genera de forma estable por
// instalacion -- reintentar el mismo dispositivo hace upsert, no duplica.
@Entity({ tableName: 'push_subscriptions' })
@Unique({ properties: ['endpoint'] })
class PushSubscriptionEntity extends BaseEntity {
  @Property()
  recipientId: string

  @Enum({ items: () => Roles })
  recipientRole: Roles

  @Property({ type: 'text' })
  endpoint: string

  @Property()
  p256dh: string

  @Property()
  auth: string

  constructor(recipientId: string, recipientRole: Roles, endpoint: string, p256dh: string, auth: string) {
    super()
    this.recipientId = recipientId
    this.recipientRole = recipientRole
    this.endpoint = endpoint
    this.p256dh = p256dh
    this.auth = auth
  }
}

export default PushSubscriptionEntity
