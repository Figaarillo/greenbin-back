/* eslint-disable indent */
import { BeforeCreate, BeforeUpdate, Entity, Enum, EventArgs, Property } from '@mikro-orm/postgresql'
import { hash, verify } from 'argon2'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import RewardPartnerPayload from '../payloads/reward-partner.payload'
import type RewardPartnerUpdatePayload from '../payloads/reward-partner.update.payload'
import { Roles } from '../../../auth/domain/entities/role'

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

  constructor(payload: RewardPartnerPayload) {
    super()
    this.name = payload.name
    this.username = payload.username
    this.address = payload.address
    this.cuit = payload.cuit
    this.email = payload.email
    this.password = payload.password
    this.phoneNumber = payload.phoneNumber
    this.role = Roles.REWARD_PARTNER
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
