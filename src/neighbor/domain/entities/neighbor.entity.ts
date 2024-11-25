/* eslint-disable indent */
import {
  BeforeCreate,
  BeforeUpdate,
  Collection,
  Entity,
  Enum,
  EventArgs,
  ManyToMany,
  ManyToOne,
  Property
} from '@mikro-orm/postgresql'
import { hash, verify } from 'argon2'
import { Roles } from '../../../auth/domain/entities/role'
import EntityEntity from '../../../entity/domain/entities/entity.entity'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import type WasteEntity from '../../../waste/domain/entities/waste.entity'
import NeighborPayload from '../payloads/neighbor.payload'
import type NeighborUpdatePayload from '../payloads/neighbor.update.payload'

@Entity()
class NeighborEntity extends BaseEntity {
  @Property()
  firstname: string

  @Property()
  lastname: string

  @Property({ unique: true })
  username: string

  @Property({ unique: true })
  email: string

  @Property({ hidden: true, lazy: true })
  password: string

  @Property()
  dni: number

  @Property()
  birthdate: Date

  @Property()
  phoneNumber: string

  @Property({ default: 0 })
  points: number = 0

  @Enum({ items: () => Roles })
  role: Roles = Roles.NEIGHBOR

  @ManyToMany()
  wastes = new Collection<WasteEntity>(this)

  @ManyToOne()
  entity: EntityEntity

  constructor(payload: NeighborPayload, entity: EntityEntity) {
    super()
    this.firstname = payload.firstname
    this.lastname = payload.lastname
    this.username = payload.username
    this.email = payload.email
    this.password = payload.password
    this.dni = payload.dni
    this.birthdate = payload.birthdate
    this.phoneNumber = payload.phoneNumber
    this.entity = entity
  }

  addPoints(points: number): void {
    this.points += points
  }

  registerWaste(waste: WasteEntity): void {
    this.wastes.add(waste)
  }

  update(payload: NeighborUpdatePayload): void {
    if (payload.firstname != null && payload.firstname !== '') {
      this.firstname = payload.firstname
    }
    if (payload.lastname != null && payload.lastname !== '') {
      this.lastname = payload.lastname
    }
    if (payload.username != null && payload.username !== '') {
      this.username = payload.username
    }
    if (payload.email != null && payload.email !== '') {
      this.email = payload.email
    }
    if (payload.phoneNumber != null) {
      this.phoneNumber = payload.phoneNumber
    }
    if (payload.points != null && payload.points >= this.points) {
      this.points = payload.points
    }
  }

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword(args: EventArgs<NeighborEntity>): Promise<void> {
    const password = args.changeSet?.payload.password

    if (password != null) {
      this.password = await hash(password)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await verify(this.password, password)
  }
}

export default NeighborEntity
