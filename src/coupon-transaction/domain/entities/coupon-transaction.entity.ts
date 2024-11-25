/* eslint-disable indent */
import { Entity, ManyToOne, OneToOne, Property } from '@mikro-orm/postgresql'
import CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'
import BaseEntity from '../../../shared/domain/entities/base.entity'

@Entity({ tableName: 'coupon_transactions' })
class CouponTransactionEntity extends BaseEntity {
  @Property()
  code: string

  @Property()
  status: string

  @Property()
  adquisitionDate?: Date

  @Property()
  redeemDate?: Date

  @Property()
  expirationDate: Date

  @Property()
  costInPoints: number

  @OneToOne()
  coupon: CouponEntity

  @ManyToOne()
  neighbor: NeighborEntity

  @ManyToOne()
  rewardPartner: RewardPartnerEntity

  constructor(
    code: string,
    status: string,
    adquisitionDate: Date | undefined,
    redeemDate: Date | undefined,
    expirationDate: Date,
    costInPoints: number,
    coupon: CouponEntity,
    neighbor: NeighborEntity,
    rewardPartner: RewardPartnerEntity
  ) {
    super()
    this.code = code
    this.status = status
    this.adquisitionDate = adquisitionDate
    this.redeemDate = redeemDate
    this.expirationDate = expirationDate
    this.costInPoints = costInPoints
    this.coupon = coupon
    this.neighbor = neighbor
    this.rewardPartner = rewardPartner
  }
}

export default CouponTransactionEntity
