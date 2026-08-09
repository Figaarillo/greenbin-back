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

  @Property({ default: true })
  couponExpiringSoon: boolean = true

  // Switch maestro de canal: independiente de las categorías de arriba. Un
  // evento solo manda mail si SU categoría está habilitada Y este flag está
  // en true. No reemplaza el opt-out por categoría del in-app/push.
  @Property({ default: true })
  emailEnabled: boolean = true

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
      case NotificationCategory.COUPON_EXPIRING_SOON:
        return this.couponExpiringSoon
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
    if (patch.couponExpiringSoon != null) this.couponExpiringSoon = patch.couponExpiringSoon
    if (patch.emailEnabled != null) this.emailEnabled = patch.emailEnabled
  }
}

export default NotificationPreferenceEntity
