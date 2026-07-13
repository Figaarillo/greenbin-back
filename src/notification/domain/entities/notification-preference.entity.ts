/* eslint-disable indent */
import { Entity, Enum, Property, Unique } from '@mikro-orm/postgresql'
import { Roles } from '../../../auth/domain/entities/role'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import { NotificationCategory } from '../enums/notification-category.enum'
import type NotificationPreferencePatch from '../payloads/notification-preference.payload'

// Modelo opt-out: todos los booleans arrancan en true, asi que un usuario que
// nunca toco sus preferencias sigue recibiendo todo (no regresivo respecto al
// comportamiento implicito de antes de que existiera esta entidad).
@Entity({ tableName: 'notification_preferences' })
@Unique({ properties: ['recipientId', 'recipientRole'] })
class NotificationPreferenceEntity extends BaseEntity {
  @Property()
  recipientId: string

  @Enum({ items: () => Roles })
  recipientRole: Roles

  @Property({ default: true })
  couponPurchased: boolean = true

  @Property({ default: true })
  couponRedeemed: boolean = true

  @Property({ default: true })
  couponCreated: boolean = true

  @Property({ default: true })
  pointsDelivered: boolean = true

  constructor(recipientId: string, recipientRole: Roles) {
    super()
    this.recipientId = recipientId
    this.recipientRole = recipientRole
  }

  isEnabledFor(category: NotificationCategory): boolean {
    switch (category) {
      case NotificationCategory.COUPON_PURCHASED:
        return this.couponPurchased
      case NotificationCategory.COUPON_REDEEMED:
        return this.couponRedeemed
      case NotificationCategory.COUPON_CREATED:
        return this.couponCreated
      case NotificationCategory.POINTS_DELIVERED:
        return this.pointsDelivered
    }
  }

  // El patch usa los mismos nombres de campo que la entidad (coincide 1:1 con
  // el DTO que manda el front) -- distinto de isEnabledFor(), que traduce
  // desde NotificationCategory (usado internamente por el dispatcher).
  updateFrom(patch: NotificationPreferencePatch): void {
    if (patch.couponPurchased != null) this.couponPurchased = patch.couponPurchased
    if (patch.couponRedeemed != null) this.couponRedeemed = patch.couponRedeemed
    if (patch.couponCreated != null) this.couponCreated = patch.couponCreated
    if (patch.pointsDelivered != null) this.pointsDelivered = patch.pointsDelivered
  }
}

export default NotificationPreferenceEntity
