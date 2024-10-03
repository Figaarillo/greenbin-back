/* eslint-disable indent */
import { BeforeCreate, BeforeUpdate, Entity, Enum, EventArgs, Property } from '@mikro-orm/postgresql'
import { hash, verify } from 'argon2'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import NeighborPayload from '../payloads/neighbor.payload'
import type NeighborUpdatePayload from '../payloads/neighbor.update.payload'
import { Roles } from '../../../auth/domain/entities/role'

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
  points: number

  @Enum({ items: () => Roles })
  role: Roles

  constructor(payload: NeighborPayload) {
    super()
    this.firstname = payload.firstname
    this.lastname = payload.lastname
    this.username = payload.username
    this.email = payload.email
    this.password = payload.password
    this.dni = payload.dni
    this.birthdate = payload.birthdate
    this.phoneNumber = payload.phoneNumber
    this.points = 0
    this.role = Roles.NEIGHBOR
  }

  addPoints(points: number): void {
    this.points += points
  }

  update(payload: NeighborUpdatePayload): void {
    if (payload.firstname != null || payload.firstname !== '') {
      this.firstname = payload.firstname
    }
    if (payload.lastname != null || payload.lastname !== '') {
      this.lastname = payload.lastname
    }
    if (payload.username != null || payload.username !== '') {
      this.username = payload.username
    }
    if (payload.email != null || payload.email !== '') {
      this.email = payload.email
    }
    if (payload.phoneNumber != null) {
      this.phoneNumber = payload.phoneNumber
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
