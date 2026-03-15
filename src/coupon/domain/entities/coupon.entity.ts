/* eslint-disable indent */
import { Entity, ManyToOne, Property } from '@mikro-orm/postgresql'
import RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import CouponPayload from '../payloads/coupon.payload'
import type CouponUpdatePayload from '../payloads/coupon.update.payload'

@Entity({ tableName: 'coupon' })
class CouponEntity extends BaseEntity {
  @Property()
  title: string

  @Property()
  description: string

  @Property()
  discount: number

  @Property()
  isAvailable: boolean

  @Property()
  state: string = 'AVAILABLE' // Cambiado de 'CREADO' para coincidir con la lógica

  @Property({ nullable: true, length: 6 })
  redemptionCode?: string

  @Property()
  validDays: number

  @Property()
  costInPoints: number

  @ManyToOne()
  rewardPartner: RewardPartnerEntity

  constructor(payload: CouponPayload, rewardPartner: RewardPartnerEntity) {
    super()
    this.title = payload.title
    this.description = payload.description
    this.discount = payload.discount
    this.isAvailable = payload.isAvailable
    this.validDays = payload.validDays
    this.costInPoints = payload.costInPoints
    this.rewardPartner = rewardPartner
  }

  update(payload: CouponUpdatePayload): void {
    this.title = payload.title ?? this.title
    this.description = payload.description ?? this.description
    this.discount = payload.discount ?? this.discount
    this.isAvailable = payload.isAvailable ?? this.isAvailable
    this.validDays = payload.validDays ?? this.validDays
    this.costInPoints = payload.costInPoints ?? this.costInPoints
    this.state = payload.state ?? this.state
  }
}

export default CouponEntity
