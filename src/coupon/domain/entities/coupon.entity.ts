/* eslint-disable indent */
import { Entity, ManyToOne, Property } from '@mikro-orm/postgresql'
import RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import CouponPayload from '../payloads/coupon.payload'

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
}

export default CouponEntity
