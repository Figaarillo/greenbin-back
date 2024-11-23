/* eslint-disable indent */
import {
  BeforeCreate,
  BeforeUpdate,
  Collection,
  Entity,
  Enum,
  EventArgs,
  ManyToOne,
  OneToMany,
  Property,
  t
} from '@mikro-orm/postgresql'
import { hash, verify } from 'argon2'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import RewardPartnerPayload from '../payloads/reward-partner.payload'
import type RewardPartnerUpdatePayload from '../payloads/reward-partner.update.payload'
import { Roles } from '../../../auth/domain/entities/role'
import EntityEntity from '../../../entity/domain/entities/entity.entity'
import CouponEntity from '../../../coupon/domain/entities/coupon.entity'

@Entity()
class RewardPartnerEntity extends BaseEntity {
  @Property({ unique: true })
  name: string

  @Property({ unique: true })
  username: string

  @Property()
  address: string

  @Property({ unique: true })
  cuit: string

  @Property({ unique: true })
  email: string

  @Property({ hidden: true, lazy: true })
  password: string

  @Property()
  phoneNumber: string

  @Enum({ items: () => Roles })
  role: Roles

  @Property({ unique: true, type: t.json })
  coordinates: {
    latitude: number
    longitude: number
  }

  @ManyToOne()
  entity: EntityEntity

  @OneToMany(() => CouponEntity, coupon => coupon.rewardPartner)
  neighbors = new Collection<CouponEntity>(this)

  constructor(payload: RewardPartnerPayload, entity: EntityEntity) {
    super()
    this.name = payload.name
    this.username = payload.username
    this.address = payload.address
    this.cuit = payload.cuit
    this.email = payload.email
    this.password = payload.password
    this.phoneNumber = payload.phoneNumber
    this.role = Roles.REWARD_PARTNER
    this.coordinates = payload.coordinates
    this.entity = entity
  }

  update(payload: RewardPartnerUpdatePayload): void {
    if (payload.name != null || payload.name !== '') {
      this.name = payload.name
    }
    if (payload.address != null || payload.address !== '') {
      this.address = payload.address
    }
    if (payload.email != null || payload.email !== '') {
      this.email = payload.email
    }
    if (payload.phoneNumber != null || payload.phoneNumber !== '') {
      this.phoneNumber = payload.phoneNumber
    }
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<RewardPartnerEntity>): Promise<void> {
    const password = args.changeSet?.payload.password

    if (password != null) {
      this.password = await hash(password)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verify(this.password, password)
  }
}

export default RewardPartnerEntity
