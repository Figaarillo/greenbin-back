/* eslint-disable indent */
import {
  BeforeCreate,
  BeforeUpdate,
  Collection,
  Entity,
  Enum,
  EventArgs,
  OneToMany,
  Property,
  t
} from '@mikro-orm/postgresql'
import { hash, verify } from 'argon2'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import EntityPayload from '../payloads/entity.payload'
import { Roles } from '../../../auth/domain/entities/role'
import NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'

@Entity({ tableName: 'entities' })
class EntityEntity extends BaseEntity {
  @Property({ unique: true })
  name: string

  @Property({ unique: true })
  email: string

  @Property({ type: t.text })
  description: string

  @Property({ hidden: true, lazy: true })
  password: string

  @Property()
  city: string

  @Property()
  province: string

  @Property({ unique: true, type: t.json })
  coordinates: {
    latitude: number
    longitude: number
  }

  @Enum({ items: () => Roles })
  role: Roles

  @OneToMany(() => NeighborEntity, neighbor => neighbor.entity)
  neighbors = new Collection<NeighborEntity>(this)

  @OneToMany(() => GreenPointEntity, greenPoint => greenPoint.entity)
  greenPoints = new Collection<GreenPointEntity>(this)

  @OneToMany(() => ResponsibleEntity, responsible => responsible.entity)
  responsible = new Collection<ResponsibleEntity>(this)

  @OneToMany(() => RewardPartnerEntity, rewardPartner => rewardPartner.entity)
  rewardPartners = new Collection<RewardPartnerEntity>(this)

  constructor(payload: EntityPayload) {
    super()
    this.name = payload.name
    this.email = payload.email
    this.description = payload.description
    this.password = payload.password
    this.city = payload.city
    this.province = payload.province
    this.coordinates = payload.coordinates
    this.role = Roles.ENTITY
  }

  update(description: string): void {
    if (description != null && description !== '') this.description = description
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<EntityEntity>): Promise<void> {
    const password = args.changeSet?.payload.password

    if (password != null) {
      this.password = await hash(password)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verify(this.password, password)
  }

  addNeighbor(neighbor: NeighborEntity): void {
    this.neighbors.add(neighbor)
  }

  addGreenPoint(greenPoint: GreenPointEntity): void {
    this.greenPoints.add(greenPoint)
  }

  addResponsible(responsible: ResponsibleEntity): void {
    this.responsible.add(responsible)
  }

  addRewardPartner(rewardPartner: RewardPartnerEntity): void {
    this.rewardPartners.add(rewardPartner)
  }
}

export default EntityEntity
